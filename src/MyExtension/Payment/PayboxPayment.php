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
            "payboxSite" => $this->nativePMConfig['site'],
            "payboxRang" => $this->nativePMConfig['rang'],
            "payboxIdentifiant" => $this->nativePMConfig['identifiant'],
            "montantEnCentimes" => number_format($order['finalPrice'],2) *100,
            "codeMonnaieNumerique" =>978,
            "commande" => $order["orderNumber"], 
            "email" => $order["userEmail"], 
            "payboxRetour" => "referencePaybox:S;montant:M;commande:R;autorisation:A;pays:I;erreur:E;signature:K",
            "dateTime" => $dateTime,
            "urlRetourNormal" => $urlNormal,
            "urlRetourEchec" => $urlEchec/*,
            "urlCallback" => $urlCallback*/

        ];
        


        $empreinteBrute  =
            "PBX_TYPEPAIEMENT=". $parametres['typePaiement'] . 
            "&PBX_TYPECARTE=" . $parametres['typeCarte']  .
            "&PBX_SITE=" . $parametres['payboxSite']  .
            "&PBX_RANG=" . $parametres['payboxRang']  .
            "&PBX_IDENTIFIANT=" . $parametres['payboxIdentifiant']  .
            "&PBX_TOTAL=" . $parametres['montantEnCentimes']  .
            "&PBX_DEVISE=" . $parametres['codeMonnaieNumerique']  .
            "&PBX_CMD=" . $parametres['commande'] . 
            "&PBX_PORTEUR=" . $parametres['email']  .
            "&PBX_RETOUR=" . $parametres['payboxRetour']  .
            "&PBX_HASH=" . "SHA512"  .
            "&PBX_TIME=" . $parametres['dateTime']  .
            "&PBX_EFFECTUE=" . $parametres['urlRetourNormal']  .
            "&PBX_REFUSE=" . $parametres['urlRetourEchec']  .
            "&PBX_ANNULE=" . $parametres['urlRetourEchec']  ;
            
        $key = $this->nativePMConfig['clef'] ;
        // On transforme la clé en binaire
        $binKey = pack("H*", $key);
        // on hashe
        $empreinteHasheeHex = strtoupper(hash_hmac('sha512', $empreinteBrute, $binKey));
        $parametres['empreinteHasheeHex'] = $empreinteHasheeHex;

        $output['url']=$parametres;
        $output['whatToDo']="submitForm";
        return $output;
    }
}