<?php
/**
 * Rubedo -- ECM solution
 * Copyright (c) 2014, WebTales (http://www.webtales.fr/).
 * All rights reserved.
 * licensing@webtales.fr
 *
 * Open Source License
 * ------------------------------------------------------------------------------------------
 * Rubedo is licensed under the terms of the Open Source GPL 3.0 license.
 *
 * @category   Rubedo
 * @package    Rubedo
 * @copyright  Copyright (c) 2012-2014 WebTales (http://www.webtales.fr)
 * @license    http://www.gnu.org/licenses/gpl.html Open Source GPL 3.0 license
 */
namespace RubedoAPI\Rest\V1\Ecommerce;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use RubedoAPI\Exceptions\APIAuthException;
use RubedoAPI\Exceptions\APIEntityException;
use RubedoAPI\Exceptions\APIRequestException;
use RubedoAPI\Rest\V1\AbstractResource;
use WebTales\MongoFilters\Filter;
use Rubedo\Services\Manager;

/**
 * Class OrdersResource
 * @package RubedoAPI\Rest\V1\Ecommerce
 */
class OrdersResource extends AbstractResource
{
    /**
     * {@inheritdoc}
     */
    public function __construct()
    {
        parent::__construct();
        $this->define();
    }
    /**
     * @param $params
     * @return array
     */
    public function getAction($params)
    {
        $user = $params['identity']->getUser();
        //var_dump($user);
        
        $filter = Filter::factory()
            ->addFilter(Filter::factory('Value')->setName('userId')->setValue($user['id']));
        $start=isset($params['start']) ? $params['start'] : 0;
        $limit=isset($params['limit']) ? $params['limit'] : null;
        //pour les admins boutique, ne pas limiter la liste de commandes à l'utilisateur, si on est sur le bloc "Liste de commandes"
        if($this->getAclService()->hasAccess('write.ui.orders') && isset($params['allCommands']) && $params['allCommands']) {
            $orders = $this->getOrdersCollection()->getList(null, array(array('property' => 'createTime', 'direction' => 'desc')),$start,$limit);            
        }
        else {
            $orders = $this->getOrdersCollection()->getList($filter, array(array('property' => 'createTime', 'direction' => 'desc')),$start,$limit);            
        }
        if (!empty($params["orderDetailPage"])) {
            $urlOptions = array(
                'encode' => true,
                'reset' => true
            );
            $orderDetailPageUrl = $this->getContext()->url()->fromRoute('rewrite', array(
                'pageId' => $params["orderDetailPage"],
                'locale' => $params['lang']->getLocale(),
            ), $urlOptions);
        }
        if(isset($params['onlyTotal'])) {
            $counter = 0;
            foreach ($orders['data'] as &$order) {
                if($order["billDocument"] && $order["billDocument"] !='' ){
                    $counter++;
                }
            }
            return array(
                'success' => true,
                'orders' => null,
                'total'=>$counter,
                'orderDetailPageUrl' => isset($orderDetailPageUrl) ? $orderDetailPageUrl : null,
            );
        }
        else {
            foreach ($orders['data'] as &$order) {
                $order = $this->maskOrderInList($order);
            }
            return array(
                'success' => true,
                'orders' => &$orders['data'],
                'total'=>&$orders['count'],
                'orderDetailPageUrl' => isset($orderDetailPageUrl) ? $orderDetailPageUrl : null,
            );
        }
    }
    /**
     * @param $params
     * @return array
     * @throws \RubedoAPI\Exceptions\APIAuthException
     * @throws \RubedoAPI\Exceptions\APIRequestException
     * @throws \RubedoAPI\Exceptions\APIEntityException
     */
    public function postAction($params)
    {
        $pmConfig = $this->getConfigService()['paymentMeans'];
        if (!isset($pmConfig[$params['paymentMeans']])) {
            sendMailError("Unknown payment method", "<p>Erreur dans OrdersResource.php, fonction postAction, Unknown payment method (params['paymentMeans']).</p><h3>params :</h3><p>".(json_encode($params))."</p>");
            throw new APIRequestException('Unknown payment method', 400);
        }
        
        //$myPaymentMeans = $pmConfig[$params['paymentMeans']];
        if (isset($params['shoppingCartToken'])){
            $myCart = $this->getShoppingCartCollection()->getCurrentCart($params['shoppingCartToken']);
        } else {
            $myCart = $this->getShoppingCartCollection()->getCurrentCart();
        }
        if (empty($myCart)) {
            sendMailError("Shopping cart empty", "<p>Erreur dans OrdersResource.php, fonction postAction, Shopping cart is empty.</p><h3>params :</h3><p>".(json_encode($params))."</p>");
            throw new APIAuthException('Shopping cart is empty', 404);
        }
        $currentUser = $this->getCurrentUserAPIService()->getCurrentUser();
        if (!(isset($currentUser['shippingAddress']) && isset($currentUser['shippingAddress']['country']))) {
            sendMailError("Missing shipping address country", "<p>Erreur dans OrdersResource.php, fonction postAction, Missing shipping address country.</p><h3>params :</h3><p>".(json_encode($params))."</p>");
            throw new APIAuthException('Missing shipping address country');
        }
        $order = array();
        $items = 0;
        foreach ($myCart as $value) {
            $items = $items + $value['amount'];
        }
        $myShippers = Manager::getService("ShippersCcn")->getApplicableShippers($currentUser['shippingAddress']['country'], $myCart);
        $shippingPrice = 0;
        $shippingTaxedPrice = 0;
        $shippingTax = 0;
        $shipperFound = false;
        $usedShipper = array();
        foreach ($myShippers['data'] as $shipper) {
            if ($shipper['shipperId'] == $params['shipperId']) {
                $shippingPrice = $shipper['rate'];
                $shippingTax = $shippingPrice * ($shipper['tax'] / 100);
                $shippingTaxedPrice = $shippingPrice + $shippingTax;
                $shipperFound = true;
                $usedShipper = $shipper;
                break;
            }
        }
        if (!$shipperFound) {
            sendMailError("ERREUR lors de la commande d'un client boutique H4", "<p>Erreur dans OrdersResource.php, fonction postAction, impossible de trouver le bon shipper.</p><h3>params :</h3><p>".(json_encode($params))."</p><h3>myShippers :</h3><p>".(json_encode($myShippers))."</p>");
            throw new APIEntityException('Shipper not found', 404);
        }
        $order['detailedCart'] = $this->addCartInfos(
            $myCart,
            $currentUser['typeId'],
            $currentUser['shippingAddress']['country'],
            isset($currentUser['shippingAddress']['regionState']) ? $currentUser['shippingAddress']['regionState'] : "*",
            isset($currentUser['shippingAddress']['postCode']) ? $currentUser['shippingAddress']['postCode'] : "*"
        );
        if (isset($params['shippingComments'])) {
            $order['shippingComments'] = $params['shippingComments'];
        }
        $order['shippingPrice'] = $shippingPrice;
        $order['shippingTaxedPrice'] = $shippingTaxedPrice;
        $order['shippingTax'] = $shippingTax;
        $order['finalTFPrice'] = $order['detailedCart']['totalPrice'] + $order['shippingPrice'];
        $order['finalTaxes'] = $order['detailedCart']['totalTaxedPrice'] - $order['detailedCart']['totalPrice'] + $order['shippingTax'];
        $order['finalPrice'] = $order['detailedCart']['totalTaxedPrice'] + $order['shippingTaxedPrice'];
        $order['shipper'] = $usedShipper;
        $order['userId'] = $currentUser['id'];
        $order['userName'] = $currentUser['name'];
        $order['userEmail'] = $currentUser['email'];
        $order['billingAddress'] = $currentUser['billingAddress'];
        $order['shippingAddress'] = $currentUser['shippingAddress'];
        $order['hasStockDecrementIssues'] = false;
        $order['stockDecrementIssues'] = array();
        $order['paymentMeans'] = $params['paymentMeans'];
        $order['status'] = "pendingPayment";
        $registeredOrder = $this->getOrdersCollection()->createOrder($order);
        if ($registeredOrder['success']){
            if (isset($params['shoppingCartToken'])){
                $this->getShoppingCartCollection()->setCurrentCart(array(),$params['shoppingCartToken']);
            } else {
                $this->getShoppingCartCollection()->setCurrentCart(array());
            }
            //si payement par chèque, envoyer mail de confirmation de commande
            if($params['paymentMeans']=='check'){
                $mailerService = Manager::getService('Mailer');
                $mailerObject2 = $mailerService->getNewMessage();
                $bodyClient = "";
                $mailerObject2->setTo(array($registeredOrder['data']['userEmail'] => $registeredOrder['data']['userName']));
                $mailerObject2->setBcc(array("siteweb.ccn@gmail.com"));
                $mailerObject2->setReplyTo(array("acnenligne@gmail.com" => "Les Ateliers du Chemin Neuf"));
                $mailerObject2->setFrom(array("ame@chemin-neuf.org" => "Les Ateliers du Chemin Neuf"));
                $mailerObject2->setCharset('utf-8');
                $mailerObject2->setSubject("Votre commande aux Ateliers du Chemin Neuf : " . $registeredOrder['data']["orderNumber"]);
                $mailerObject2->setBody($this->getMailConfirmation($registeredOrder['data']), 'text/html', 'utf-8');
                $mailerService->sendMessage($mailerObject2,$errors);
            }
        } else { 
            // registering order has failed, send email to admin
            sendMailError("getOrdersCollection()->createOrder(order) a échoué", "<p>Dans OrdersResource.php, fonction postAction, la fonction getOrdersCollection()->createOrder(order) a échoué.</p><h3>params : </h3><p>".(json_encode($params))."</p><h3>order : </h3><p>".(json_encode($order))."</p>");
        }
        return array(
            'success' => $registeredOrder['success'],
            'order' => $registeredOrder['data'],
        );
    }
    
    private function getMailConfirmation($order) {
        $body = '<table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0;padding:0;font-family:Lucida Grande,Arial,Helvetica,sans-serif;font-size:11px;min-width:690px">';
        $body.="<tr><td bgcolor='#f3eeea' align='center'><table cellspacing='10' cellpadding='0' border='0' width='670'>";
        //header
        $body .= '<tr><td style="padding-top:11px;padding-bottom:7px;color:#ffffff"><img height="100" src="https://www.laboutique-chemin-neuf.com/dam?media-id=56c49b78c445ecc9008b6574&mode=boxed&height=150" alt="La Boutiques des Ateliers du Chemin Neuf"/></td></tr>';
        //texte d'intro
        $body .= '<tr><td bgcolor="white"><table cellspacing="10" cellpadding="0" border="0" width="650">';
        //Bonjour Nicolas,
        $body .= '<tr><td valign="top"><h1>Bonjour '. $order['userName'].',</h1>';
        //Confirmation de commande
        $body .= '<p style="font-size:12px;">Nous vous confirmons que nous avons bien enregistré votre commande  n°' .$order["orderNumber"] . ' en date du ' . substr($order['dateCode'],6,2).'/'.substr($order['dateCode'],4,2) . '/' . substr($order['dateCode'],0,4) . '.<br/> ';
        $body .= 'Vous avez choisi un payement par chèque. Votre commande sera traitée à la réception du chèque.<br/>';
        //$body .= 'Vous pourrez suivre l\'avancement de votre commande <a href="https://www.laboutique-chemin-neuf.com/fr/mes-commandes/detail-commande?order='.$order['id'] .'">en vous connectant sur le site</a> ()</p></td></tr>';
        $body .= 'Vous pourrez suivre l\'avancement de votre commande <a href="https://www.laboutique-chemin-neuf.com/fr/mes-commandes/">en vous connectant sur le site</a> (pour voir vos commandes, vous devrez vous connecter si vous ne l\'êtes pas)</p></td></tr>';
        //Récapitulatif de commande
        $body .= '<tr><td><h3>Récapitulatif de votre commande</h3></td></tr>';
        $body .= '<tr><td><table cellspacing="0" cellpadding="0" border="0" width="650" style="border:1px solid #eaeaea">';
        $body .= '<thead><tr><th align="left" bgcolor="#EAEAEA" style="font-size:13px;padding:3px 9px">Article</th> <th align="center" bgcolor="#EAEAEA" style="font-size:13px;padding:3px 9px">Qté</th><th align="right" bgcolor="#EAEAEA" style="font-size:13px;padding:3px 9px">Sous-total</th></tr></thead>'; 
        foreach($order['detailedCart']['cart'] as $item) {
            $body .= '<tr><td align="left" valign="top" style="font-size:11px;padding:6px 9px;border-bottom:1px dotted #cccccc"><strong>' . $item['title'] .'</strong></td>';
            $body .= '<td align="center" valign="top" style="font-size:11px;padding:6px 9px;border-bottom:1px dotted #cccccc">' . $item['amount']. '</td>';
            $body .= '<td align="right" valign="top" style="font-size:11px;padding:6px 9px;border-bottom:1px dotted #cccccc">' . $item['taxedPrice']. ' €</td></tr>';
        }
        $body .='<tr bgcolor="white"><td colspan="2" align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px">Total produits (HT)</td><td align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px">' . $order['detailedCart']['totalPrice']. ' €</td></tr>';
        $body .='<tr bgcolor="white"><td colspan="2" align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px">Total produits (TTC)</td><td align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px">' . $order['detailedCart']['totalTaxedPrice']. ' €</td></tr>';
        $body .='<tr bgcolor="white"><td colspan="2" align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px">Frais d\'expédition <small>('.$order['shipper']['name'] . ')</small></td><td align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px">' . round($order['shippingTaxedPrice'],2). ' €</td></tr>';
        $totalPrice = $order['detailedCart']['totalTaxedPrice'] + round($order['shippingTaxedPrice'],2);
        $body .='<tr bgcolor="white"><td colspan="2" align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px"><strong>Prix total</strong></td><td align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px">' .  $totalPrice . ' €</td></tr></table><br>';
        $body .= '<table cellspacing="0" cellpadding="0" border="0" width="650">';
        $body .= '<thead><tr><th align="left" width="320" bgcolor="#EAEAEA" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;padding:5px 9px 6px 9px;line-height:1em">Adresse de facturation :</th><th width="10"></th>';
        $body .= '   <th align="left" width="320" bgcolor="#EAEAEA" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;padding:5px 9px 6px 9px;line-height:1em">Adresse d\'expédition :</th></tr></thead>';
        $body .= '<tr><td valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;padding:7px 9px 9px 9px;border-left:1px solid #eaeaea;border-bottom:1px solid #eaeaea;border-right:1px solid #eaeaea;width:319px">';
        $body .= '<p>';
        if(isset($order['billingAddress']['company'])) $body .= '<strong>'.$order['billingAddress']['company'].'</strong><br/>';
         $body .= $order['billingAddress']['surname'] . ' ' . $order['billingAddress']['name'] . '<br/>';
        if(isset($order['billingAddress']['address1'])) $body .= $order['billingAddress']['address1'] . '<br/>' ;
        if(isset($order['billingAddress']['address2'])) $body .= $order['billingAddress']['address2'] . '<br/>' ;
        if(isset($order['billingAddress']['postCode'])) $body .= $order['billingAddress']['postCode'] . ' - ' . $order['billingAddress']['city'] . '<br/>' ;
        $body .= $order['billingAddress']['country'];
        $body .= '</p></td><td>&nbsp;</td><td valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;padding:7px 9px 9px 9px;border-left:1px solid #eaeaea;border-bottom:1px solid #eaeaea;border-right:1px solid #eaeaea;width:319px">';
        $body .= '<p>';
        if(isset($order['shippingAddress']['company'])) $body .= '<strong>'.$order['shippingAddress']['company'].'</strong><br/>';
         $body .= $order['shippingAddress']['surname'] . ' ' . $order['shippingAddress']['name'] . '<br/>';
        if(isset($order['shippingAddress']['address1'])) $body .= $order['shippingAddress']['address1'] . '<br/>' ;
        if(isset($order['shippingAddress']['address2'])) $body .= $order['shippingAddress']['address2'] . '<br/>' ;
        if(isset($order['shippingAddress']['postCode'])) $body .= $order['shippingAddress']['postCode'] . ' - ' . $order['shippingAddress']['city'] . '<br/>' ;
        $body .= $order['shippingAddress']['country'];
        $body .= '</p>';

        
        $body .='</td></tr></table></td></tr>';
        $body .= '<tr><td><pstyle="font-size:12px;">Merci de votre confiance et à bientôt <a href="https://www.laboutique-chemin-neuf.com">sur notre site</a>.</p><p>Les Ateliers du Chemin Neuf</p></td></tr>';
        $body .='</table></td></tr>';
        $body .="</table></td></tr></table>";
        return $body;
    }

    function sendMailError($objet, $body) {
        $mailerService = Manager::getService('Mailer');
        $mailerObject2 = $mailerService->getNewMessage();
        $mailerObject2->setTo(array("web@chemin-neuf.org" => "Admin Web CCN"));
        $mailerObject2->setReplyTo(array("acnenligne@gmail.com" => "Les Ateliers du Chemin Neuf"));
        $mailerObject2->setFrom(array("ame@chemin-neuf.org" => "Les Ateliers du Chemin Neuf"));
        $mailerObject2->setCharset('utf-8');
        $mailerObject2->setSubject("[ERROR BOUTIQUE] ".$objet);
        $mailerObject2->setBody($body, 'text/html', 'utf-8');
        $mailerService->sendMessage($mailerObject2,$errors);
    }
    
    
    /**
     * @param $cart
     * @param $userTypeId
     * @param $country
     * @param $region
     * @param $postalCode
     * @return array
     */
    protected function addCartInfos($cart, $userTypeId, $country, $region, $postalCode)
    {
        $totalPrice = 0;
        $totalTaxedPrice = 0;
        $totalItems = 0;
        $ignoredArray = array('price', 'amount', 'id', 'sku', 'stock', 'basePrice', 'specialOffers');
        foreach ($cart as &$value) {
            $value["productId"] = (string) $value["productId"];
            $value["variationId"] = (string) $value["variationId"];
            $myContent = $this->getContentsCollection()->findById($value['productId'], true, false);
            if ($myContent) {
                $value['title'] = $myContent['text'];
                if (isset($myContent["fields"]["image"])&&!empty($myContent["fields"]["image"])){
                    $value["image"]=$myContent["fields"]["image"];
                }
                $value['subtitle'] = '';
                $value['variationProperties'] = array();
                $unitPrice = 0;
                $taxedPrice = 0;
                $unitTaxedPrice = 0;
                $price = 0;
                foreach ($myContent['productProperties']['variations'] as $variation) {
                    if ($variation['id'] == $value['variationId']) {
                        if (array_key_exists('specialOffers', $variation)) {
                            $variation["price"] = $this->getBetterSpecialOffer($variation['specialOffers'], $variation["price"]);
                            $value['unitPrice'] = $variation["price"];
                        }
                        $unitPrice = $variation['price'];
                        $unitTaxedPrice = $this->getTaxesCollection()->getTaxValue($myContent['typeId'], $userTypeId, $country, $region, $postalCode, $unitPrice);
                        $price = $unitPrice * $value['amount'];
                        $taxedPrice = $unitTaxedPrice * $value['amount'];
                        $totalTaxedPrice = $totalTaxedPrice + $taxedPrice;
                        $totalPrice = $totalPrice + $price;
                        $totalItems = $totalItems + $value['amount'];
                        foreach ($variation as $varkey => $varvalue) {
                            if (!in_array($varkey, $ignoredArray)) {
                                $value['subtitle'] .= ' ' . $varvalue;
                                $value['variationProperties'][$varkey] = $varvalue;
                            }
                        }
                    }
                }
                $value['price'] = $price;
                $value['unitPrice'] = $unitPrice;
                $value['unitTaxedPrice'] = $unitTaxedPrice;
                $value['taxedPrice'] = $taxedPrice;
            }
        }
        return array(
            'cart' => array_values($cart),
            'totalPrice' => $totalPrice,
            'totalTaxedPrice' => $totalTaxedPrice,
            'totalItems' => $totalItems
        );
    }
    /**
     * @param $offers
     * @param $basePrice
     * @return mixed
     */
    protected function getBetterSpecialOffer($offers, $basePrice)
    {
        $actualDate = new \DateTime();
        foreach ($offers as $offer) {
            $beginDate = $offer['beginDate'];
            $endDate = $offer['endDate'];
            $offer['beginDate'] = new \DateTime();
            $offer['beginDate']->setTimestamp($beginDate);
            $offer['endDate'] = new \DateTime();
            $offer['endDate']->setTimestamp($endDate);
            if (
                $offer['beginDate'] <= $actualDate
                && $offer['endDate'] >= $actualDate
                && $basePrice > $offer['price']
            ) {
                $basePrice = $offer['price'];
            }
        }
        return $basePrice;
    }
    /**
     * @param $id
     * @param $params
     * @return array
     * @throws \RubedoAPI\Exceptions\APIEntityException
     */
    public function getEntityAction($id, $params)
    {
        $user = $params['identity']->getUser();
        $isAdmin=false;
        if($this->getAclService()->hasAccess('write.ui.orders')) {
            $filters = Filter::factory()
               // ->addFilter(Filter::factory('Value')->setName('userId')->setValue($user['id'])) pour utilisateurs connectés "Admin boutique"
                ->addFilter(Filter::factory('Uid')->setValue($id));
            $order = $this->getOrdersCollection()->findOne($filters);
            $isAdmin=true;
        }
        else {
            $filters = Filter::factory()
                ->addFilter(Filter::factory('Value')->setName('userId')->setValue($user['id']))
                ->addFilter(Filter::factory('Uid')->setValue($id));
            $order = $this->getOrdersCollection()->findOne($filters);
        }
            
            
            
        if (empty($order)) {
            throw new APIEntityException('Order not found', 404);
        }
        return array(
            'success' => true,
            'order' => $order,
            'isAdmin' => $isAdmin
        );
    }
    
    
    
   /**
     * Patch a content
     *
     * @param $id
     * @param $params
     * @return array
     * @throws \RubedoAPI\Exceptions\APIAuthException
     * @throws \RubedoAPI\Exceptions\APIEntityException
     */
    public function patchEntityAction($id, $params)
    {
        /*get actual order*/
        $user = $params['identity']->getUser();
        $isAdmin=false;
        if($user["defaultGroup"] == "57222992c445ec68568bf2da"){
            $filters = Filter::factory()
               // ->addFilter(Filter::factory('Value')->setName('userId')->setValue($user['id'])) pour utilisateurs connectés "Admin boutique"
                ->addFilter(Filter::factory('Uid')->setValue($id));
            $order = $this->getOrdersCollection()->findOne($filters);
            $isAdmin=true;
        }
        else {
        }
        $toUpdate = $params['order'];
        if (isset($toUpdate['billDocument']) &&  $toUpdate['billDocument'] != "") $order["billDocument"] = $toUpdate["billDocument"];
        if (isset($toUpdate['status']) &&  $toUpdate['status'] != "") $order["status"] = $toUpdate["status"];
        $update =$this->getOrdersCollection()->update($order);
        return [
            'success' => $update['success'],
            'order' => $order,
            'inputErrors'=>isset($update["inputErrors"]) ? $update["inputErrors"] : false
        ];
    }    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    /**
     * @param $order
     * @return array
     */
    public function maskOrderInList($order)
    {
        $mask = array('status', 'id', 'orderNumber','userName', 'finalPrice','createTime','paymentMeans','shipper');
        return array_intersect_key($order, array_flip($mask));
    }
    /**
     *
     */
    protected function define()
    {
        $this
            ->definition
            ->setName('Orders')
            ->setDescription('Deal with Orders')
            ->editVerb('get', function (VerbDefinitionEntity &$entity) {
                $this->defineGet($entity);
            })
            ->editVerb('post', function (VerbDefinitionEntity &$entity) {
                $this->definePost($entity);
            });
        $this
            ->entityDefinition
            ->setName('Order')
            ->setDescription('Deal with order')
            ->editVerb('get', function (VerbDefinitionEntity &$entity) {
                $this->defineGetEntity($entity);
            })
            ->editVerb('patch', function (VerbDefinitionEntity &$entity) {
                $this->defineEntityPatch($entity);
            });
    }
    /**
     * @param VerbDefinitionEntity $entity
     */
    protected function defineGet(VerbDefinitionEntity &$entity)
    {
        $entity
            ->setDescription('Get a list of orders')
            ->identityRequired()
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('start')
                    ->setDescription('Item\'s index number to start')
                    ->setFilter('int')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('limit')
                    ->setDescription('How much orders to return')
                    ->setFilter('int')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('orderDetailPage')
                    ->setDescription('Order details page')
                    ->setFilter('\MongoId')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('allCommands')
                    ->setDescription('Voir toutes les commandes - pour des utilisateurs avec les droits d\'admin sur la Boutique')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('onlyTotal')
                    ->setDescription('Nombre de commandes seulement')
            )
            ->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Orders')
                    ->setKey('orders')
                    ->setRequired()
            )->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Total number of orders')
                    ->setKey('total')
            )
            ->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Order details page url')
                    ->setKey('orderDetailPageUrl')
            );
    }
    /**
     * @param VerbDefinitionEntity $entity
     */
    protected function definePost(VerbDefinitionEntity &$entity)
    {
        $entity
            ->setDescription('Post new order')
            ->identityRequired()
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Payment mean')
                    ->setKey('paymentMeans')
                    ->setRequired()
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Shipper')
                    ->setKey('shipperId')
                    ->setRequired()
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Shipping comments')
                    ->setKey('shippingComments')
                    ->setFilter('string')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Shopping cart token')
                    ->setKey('shoppingCartToken')
            )
            ->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Order')
                    ->setKey('order')
                    ->setRequired()
            );
    }
    /**
     * @param VerbDefinitionEntity $entity
     */
    protected function defineGetEntity(VerbDefinitionEntity &$entity)
    {
        $entity
            ->setDescription('Get an order')
            ->identityRequired()
            ->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Order')
                    ->setKey('order')
                    ->setRequired()
            )
             ->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('True si l\'utilisateur est admin de la Boutique')
                    ->setKey('isAdmin')
                    ->setRequired()
            );
    }
    /**
     * Define patch entity
     *
     * @param VerbDefinitionEntity $definition
     */
    protected function defineEntityPatch(VerbDefinitionEntity &$entity)
    {
        $entity
            ->setDescription('Patch an order')
            ->identityRequired()
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('The order')
                    ->setKey('order')
                    ->setRequired()
            )
            ->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('The order')
                    ->setKey('order')
                    ->setRequired()
            )->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Input errors')
                    ->setKey('inputErrors')
            );
    }
}
