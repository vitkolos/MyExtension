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
namespace Rubedo\Payment;
use Rubedo\Services\Manager;
use Zend\Json\Json;
/**
 *
 * @author adobre
 * @category Rubedo
 * @package Rubedo
 */
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
        $dateTime = date("c");
        $urlNormal="http://" . $_SERVER['HTTP_HOST'];//. "/payment/success";
        $urlEchec="http://" . $_SERVER['HTTP_HOST'];//. "/payment/cancel";
        //$urlCallback="http://" . $_SERVER['HTTP_HOST'] . "/api/v1/PayboxIpn/";

        $parametres = [
            "typePaiement" => "CARTE",
            "typeCarte" => "CB",
            "payboxSite" => "5138580",
            "payboxRang" => "01",
            "payboxIdentifiant" => "413840770",
            "montantEnCentimes" => number_format($order['finalPrice'],2) *100,
            "codeMonnaieNumerique" =>978,
            "commande" => "commande", 
            "email" => "nicolas.rhone@gmail.com", 
            "payboxRetour" => "referencePaybox:S;montant:M;commande:R;autorisation:A;pays:I;erreur:E;signature:K",
            "dateTime" => $dateTime,
            "urlRetourNormal" => $urlNormal,
            "urlRetourEchec" => $urlEchec/*,
            "urlCallback" => $urlCallback*/,
            "order"=>$order,
            "config" => $this->nativePMConfig
        ];        
        $output['url']=$parametres;
        $output['whatToDo']="submitForm";
        return $output;
    }
}