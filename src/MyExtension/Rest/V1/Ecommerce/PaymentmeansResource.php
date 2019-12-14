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
use Rubedo\Collection\AbstractCollection;
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
        if(isset($params['filter_by_site']) && $params['filter_by_site']) {
            $accountName="";
            $codeMonnaie="";
            $monnaie="";
            $paymentModes=array(
                "carte"=>false,
                "virement"=>false,
                "paypal"=>false,
                "cheque"=>false,
                "dotpay" => false,
            );
            
            $paymentMeans = Manager::getService("SitesConfigCcn")->getConfig();
            if($paymentMeans['success']) {
                $arrayToReturn = array_intersect_key($paymentMeans['paymentConfig'], array_flip(array("id","paymentMeans","displayName","nativePMConfig")));
                //determiner les types de payement possibles
               if($params['type']=='paf' && isset($paymentMeans['paymentConfig']['nativePMConfig']['conf_paf']) && $paymentMeans['paymentConfig']['nativePMConfig']['conf_paf'] !='' ) {
                    $wasFiltered = AbstractCollection::disableUserFilter(true);
                    $contentsService = Manager::getService("Contents");
                    $pafConfig = $contentsService->findById($paymentMeans['paymentConfig']['nativePMConfig']['conf_paf'],false,false);
                    if(isset($pafConfig['fields']['site']) && $pafConfig['fields']['site'] !='' ) $paymentModes["carte"] = true;
                    if(isset($pafConfig['fields']['paypal']) && $pafConfig['fields']['paypal'] !='' ) $paymentModes["paypal"] = true;
                    if(isset($pafConfig['fields']['libelleCheque']) && $pafConfig['fields']['libelleCheque'] !='' ) $paymentModes["cheque"] = true;
                    if(isset($pafConfig['fields']['dotpay_id']) && $pafConfig['fields']['dotpay_id'] !='' ) $paymentModes["dotpay"] = true;
                    if(isset($pafConfig['fields']['titreCompteVir']) && $pafConfig['fields']['titreCompteVir'] !='' ) $paymentModes["virement"] = true;
                    $arrayToReturn["paymentModes"] = $paymentModes;
                }
                $arrayToReturn["nativePMConfig"] = array(
                                                        "fiscalite" =>$arrayToReturn["nativePMConfig"]["fiscalite"],
                                                        "monnaie" => $arrayToReturn["nativePMConfig"]["monnaie"],
                                                        "codeMonnaie" => $arrayToReturn["nativePMConfig"]["codeMonnaie"],
                                                        "conditionId"=>$arrayToReturn["nativePMConfig"]["defaut_conditionId"],
                                                        "codeMonnaieAlpha" =>$arrayToReturn["nativePMConfig"]["codeMonnaieAlpha"],
                                                        "monnaie_before" =>$arrayToReturn["nativePMConfig"]["monnaie_before"]
                );
                if($params['type']=='dons' && isset($paymentMeans['paymentConfig']["nativePMConfig"]["contactDonsId"]) && $paymentMeans['paymentConfig']["nativePMConfig"]["contactDonsId"] !='' ) {
                    $arrayToReturn["nativePMConfig"]["contactDonsId"] = $paymentMeans['paymentConfig']["nativePMConfig"]["contactDonsId"];
                    $arrayToReturn["nativePMConfig"]["donationText"] = $paymentMeans['paymentConfig']["nativePMConfig"]["donationText"];
                }
                if($params['type']=='paf') $arrayToReturn["nativePMConfig"]["conf_paf"] = $paymentMeans['paymentConfig']['nativePMConfig']['conf_paf'];
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
