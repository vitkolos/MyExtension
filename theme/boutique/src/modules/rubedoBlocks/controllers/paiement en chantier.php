<?php
namespace Rubedo\Payment;
use Rubedo\Services\Manager;
abstract class AbstractPayment
{

    protected $paymentMeans;
    protected $nativePMConfig;
    public function __construct()
    {
        if (empty($this->paymentMeans)) {
            throw new \Rubedo\Exceptions\Server("Payment means name is not set");
        }
        $pmConfig = Manager::getService("PaymentConfigs")->getConfigForPM($this->paymentMeans);
        if (!$pmConfig['success']) {
            throw new \Rubedo\Exceptions\Server("Unable to retrieve payment means config config");
        }
        if (!$pmConfig['data']['active']) {
            throw new \Rubedo\Exceptions\Server("Payment means is not activated");
        }
        $this->nativePMConfig = $pmConfig['data']['nativePMConfig'];
    }
}


//namespace Rubedo\Payment;
//use Rubedo\Services\Manager;
//use Zend\Json\Json;

class PayboxPayment extends AbstractPayment
{
    public function __construct()
    {
        $this->paymentMeans = 'paybox';
        parent::__construct();
    }
    public function getOrderPaymentData($order,$currentUserUrl)
    {
        $output = array();
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $this->nativePMConfig['endpoint']);
        $payload = array(
            "actionType" => "PAY",
            "currencyCode" => "EUR",
            "receiverList" => array(
                "receiver" => array(
                    array(
                        "amount" => (string) number_format($order['finalPrice'],2),
                        "email" => $this->nativePMConfig['userEmail']
                    )
                )
            ),
            "returnUrl" => $currentUserUrl,
            "cancelUrl" => $currentUserUrl,
            "ipnNotificationUrl" => "http://" . $_SERVER['HTTP_HOST'] . "/api/v1/ecommerce/payments/paypal",
            "requestEnvelope" => array(
                "errorLanguage" => "en_US",
                "detailLevel" => "ReturnAll"
            )
        );
        $payload = Json::encode($payload);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array(
            'Content-type: application/json',
            'Content-Length: ' . strlen($payload),
            'X-PAYPAL-SECURITY-USERID: ' . $this->nativePMConfig['userID'],
            'X-PAYPAL-SECURITY-PASSWORD: ' . $this->nativePMConfig['userPassword'],
            'X-PAYPAL-SECURITY-SIGNATURE: ' . $this->nativePMConfig['userSignature'],
            'X-PAYPAL-APPLICATION-ID: ' . $this->nativePMConfig['applicationID'],
            'X-PAYPAL-REQUEST-DATA-FORMAT: JSON',
            'X-PAYPAL-RESPONSE-DATA-FORMAT: JSON'
        ));
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        $result = curl_exec($curl);
        curl_close($curl);
        $result = Json::decode($result, Json::TYPE_ARRAY);
        if ($result['responseEnvelope']['ack'] != "Success") {
            throw new \Rubedo\Exceptions\Server("Paykey retrieval error");
        }
        $order['paypalPayKey'] = $result["payKey"];
        $updatedOrder = Manager::getService("Orders")->update($order);
        if (!$updatedOrder['success']) {
            throw new \Rubedo\Exceptions\Server("Error updating order");
        }
        $output['url']=$this->nativePMConfig['customerRedirect'] . "?cmd=_ap-payment&paykey=" . $result["payKey"];
        $output['whatToDo']="redirectToUrl";
        return $output;
    }
}