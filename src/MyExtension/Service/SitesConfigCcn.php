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
    public function getConfig($type)
    {
        $accountName="paf_fr";
        $countryID="FR";
        switch($_SERVER['HTTP_HOST']){
            //FRANCE
            case "www.chemin-neuf.fr" :
            case "www2.chemin-neuf.fr" : 
                    if($type=="dons") $accountName="dons_fr";
                    else if($type=="paf") $accountName="paf_fr";
                    $countryID="FR";
                    $codeMonnaie=978;
                    break;
            //POLOGNE
            case "www.chemin-neuf.pl" :
                    $accountName="paf_pl";
                    $codeMonnaie=985;
                    $countryID="PL";
                    break;
            //ESPAGNE
            case "es.chemin-neuf.org" :
            case "www.chemin-neuf.es" :
                    $accountName="paf_es";
                    $codeMonnaie=978;
                    $countryID="ES";
                    break;
            //ITALIE
            case "www.chemin-neuf.it" :
                    $accountName="paf_it";
                    $codeMonnaie=978;
                    $countryID="IT";
                    break;
            //HONGRIE
            case "hu.chemin-neuf.org" :
            case "www.chemin-neuf.hu" :
                    $accountName="paf_hu";
                    $codeMonnaie=348;
                    $countryID="HU";
                    break;
        }
        $paymentConfig=Manager::getService("PaymentConfigs")->getConfigForPM($accountName);
        if($paymentConfig['success']){
            return array(
                    'success' => true,
                    'paymentConfig' =>$paymentConfig['data'],
                    'codeMonnaie' => $codeMonnaie,
                    'countryID' => $countryID
            );
        }
        
    }


}
