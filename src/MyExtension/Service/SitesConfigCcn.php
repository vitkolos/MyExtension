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
namespace Rubedo\Collection;

//use Rubedo\Interfaces\Collection\IShippers;
use Rubedo\Services\Manager;

/**
 * Service to handle Shippers
 *
 * @author adobre
 * @category Rubedo
 * @package Rubedo
 */
class SitesConfigCcn extends AbstractCollection
{
    public function __construct()
    {
        $this->_collectionName = 'SitesConfig';
        parent::__construct();
    }

    /**
     * @see \Rubedo\Interfaces\Collection\IShippers::getApplicableShippers
     */
    public function getConfig()
    {
        $accountName="france";
        switch($_SERVER['HTTP_HOST']){
            //FRANCE
            case "www.chemin-neuf.fr" :
            case "www2.chemin-neuf.fr" :
                    $accountName="france";
                    break;
            //POLOGNE
            case "www.chemin-neuf.pl" :
                    $accountName="pologne";
                    break;
            //ITALIE
            case "www.chemin-neuf.it" :
                    $accountName="italie";
                    break;
            //ESPAGNE
            case "www.chemin-neuf.es" :
                    $accountName="espagne";
                    break;
            //LIBAN
            case "lb.chemin-neuf.org" :
                    $accountName="liban";
                    break;
            //ISRAEL
            case "il.chemin-neuf.org" :
            case "il2.chemin-neuf.org" :
                    $accountName="israel";
                    break;
            //BELGIQUE
            case "www.chemin-neuf.be" :
            case "test.chemin-neuf.be" :
                    $accountName="belgique";
                    break;
            //MARTINIQUE
            case "mq2.chemin-neuf.org" :
            case "mq.chemin-neuf.org" :
                    $accountName="martinique";
                    break;
            //CANADA
            case "ca.chemin-neuf.org" :
            case "www.chemin-neuf.ca" :
                    $accountName="canada";
                    break;
            //HONGRIE
            case "hu.chemin-neuf.org" :
            case "www.chemin-neuf.hu" :
                    $accountName="hongrie";
                    break;
            //ROYAUME UNI
            case "uk.chemin-neuf.org" :
            case "www.chemin-neuf.org.uk" :
                    $accountName="uk";
                    break;
            //BRESIL
            case "br2.chemin-neuf.org" :
            case "br2.chemin-neuf.org" :
                    $accountName="bresil";
                    break;
        }
        $paymentConfig=Manager::getService("PaymentConfigs")->getConfigForPM($accountName);
        if($paymentConfig['success']){
            return array(
                    'success' => true,
                    'paymentConfig' =>$paymentConfig['data']
            );
        }
        
    }


}
