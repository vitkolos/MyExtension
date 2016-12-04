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
use Rubedo\Services\Manager;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use RubedoAPI\Exceptions\APIEntityException;
use RubedoAPI\Rest\V1\AbstractResource;
/**
 * Class ShippersResource
 * @package RubedoAPI\Rest\V1\Ecommerce
 */
class PaymentmeansResource extends AbstractResource
{
    /**
     * { @inheritdoc }
     */
    public function __construct()
    {
        parent::__construct();
        $this
            ->definition
            ->setName('Payment Means')
            ->setDescription('Deal with Payment Means')
            ->editVerb('get', function (VerbDefinitionEntity &$entity) {
                $entity
                    ->setDescription('Get a list of active Payment Means')
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Filtrer par site')
                            ->setKey('filter_by_site')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Dons ou autre')
                            ->setKey('type')
                    )
                    ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Payment Means')
                            ->setKey('paymentMeans')
                            ->setRequired()
                    );
            });
    }
    /**
     * Get to ecommerce/paymentmeans
     *
     * @param $params
     * @throws \RubedoAPI\Exceptions\APIEntityException
     * @return array
     */
    public function getAction($params)
    {
        if($params['filter_by_site']) {
            $accountName="";
            $codeMonnaie="";
            $monnaie="";
            $paymentModes=array(
                "carte"=>false,
                "cheque"=>false
            );
            switch($_SERVER['HTTP_HOST']) {
                case "chemin-neuf.fr" : 
                    if($params['type']=="dons") $accountName="dons_fr";
                    else if($params['type']=="paf") $accountName="paf_fr";
                    $codeMonnaie=978;
                    //$monnaie="€";
                    break;
                case "www.chemin-neuf.pl" :
                    $accountName="paf_pl";
                    $codeMonnaie=985;
                    //$monnaie="zł";
                    break;
                case "es.chemin-neuf.org" :
                case "chemin-neuf.es" :
                    $accountName="paf_es";
                    $codeMonnaie=978;
                    //$monnaie="zł";
                    break;
                case "hu.chemin-neuf.org" :
                case "chemin-neuf.hu" :
                    $accountName="paf_hu";
                    $codeMonnaie=348;
                    //$monnaie="zł";
                    break;
            }
            $paymentMeans=Manager::getService("PaymentConfigs")->getConfigForPM($accountName);
            if($paymentMeans['success']) {
                $arrayToReturn = array_intersect_key($paymentMeans['data'], array_flip(array("id","paymentMeans","displayName","logo","nativePMConfig")));
                //determiner les types de payement possibles
                if($arrayToReturn["nativePMConfig"]["paybox"] && $arrayToReturn["nativePMConfig"]["paybox"] !="") {
                    $paymentModes["carte"] = true;
                    $arrayToReturn["onlinePaymentMeans"]="paybox";
                }
                else if($arrayToReturn["nativePMConfig"]["dotpay_id"] && $arrayToReturn["nativePMConfig"]["dotpay_id"] !="") {
                    $paymentModes["carte"] = true;
                    $arrayToReturn["onlinePaymentMeans"]="dotpay";
                }
                if($arrayToReturn["nativePMConfig"]["libelle_cheque"] && $arrayToReturn["nativePMConfig"]["libelle_cheque"] !="") {
                    $paymentModes["cheque"] = true;
                }
                $arrayToReturn["paymentModes"] = $paymentModes;
                $arrayToReturn["nativePMConfig"] = array(
                                                         "contactDonsId" => $arrayToReturn["nativePMConfig"]["contactDonsId"],
                                                         "fiscalite" =>$arrayToReturn["nativePMConfig"]["fiscalite"],
                                                         "monnaie" => $arrayToReturn["nativePMConfig"]["monnaie"],
                                                         "codeMonnaie" => $codeMonnaie
                                                         );
                return array(
                    'success' => true,
                    'paymentMeans' => $arrayToReturn
                );
            }
            else {
                return array(
                    'success' => false,
                    'paymentMeans' =>"Payment means not installed"
                );
            }
        }
        else {
            $paymentMeans=Manager::getService("PaymentConfigs")->getActivePMConfigs();
            foreach ($paymentMeans['data'] as &$pm){
                $pm=array_intersect_key($pm, array_flip(array("id","paymentMeans","displayName","logo")));
            }
            return array(
                'success' => true,
                'paymentMeans' => $paymentMeans['data'],
            );            
        }
        
    }
}
