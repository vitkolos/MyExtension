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

use Rubedo\Interfaces\Collection\IShippers;
use Rubedo\Services\Manager;

/**
 * Service to handle Shippers
 *
 * @author adobre
 * @category Rubedo
 * @package Rubedo
 */
class ShippersCcn extends AbstractCollection implements IShippers
{
    public function __construct()
    {
        $this->_collectionName = 'Shippers';
        parent::__construct();
    }

    /**
     * @see \Rubedo\Interfaces\Collection\IShippers::getApplicableShippers
     */
    public function getApplicableShippers($country, $myCart)
    {
        $pipeline = array();
        $pipeline[] = array(
            '$project' => array(
                'shipperId' => '$_id',
                '_id' => 0,
                'name' => '$name',
                'rateType' => '$rateType',
                'rates' => '$rates'
            )
        );
        $pipeline[] = array(
            '$unwind' => '$rates'
        );
        /*map country et zones*/
        $europe = array('DE','AT','BE','ES','FI','GR','IT','LU,','NL','PL','PT','CZ','GB','SE','DK','NO','IE','RO','SK','CY','EE','LV','LI','LT','MT','HU','SI','UA');
        $northamerica = array('CA','US','BB','BM','MX','VG','VI');
        if(in_array($country, $europe)){
            $pipeline[] = array(
                '$match' => array(
                    'rates.country' => array(
                        '$in' => array('EU')
                    )
                )
            );
        }
        else if(in_array($country, $northamerica)){
            $pipeline[] = array(
                '$match' => array(
                    'rates.country' => array(
                        '$in' => array('AM')
                    )
                )
            );
        }
        else {
            $pipeline[] = array(
                '$match' => array(
                    'rates.country' => array(
                        '$in' => array($country)
                    )
                )
            );
        }
        $response = $this->_dataService->aggregate($pipeline);
        if ($response['ok']) {
            $itemNumber=0;
            $cartWeight = 0;
            foreach ($myCart as $value) {
                $itemNumber = $itemNumber + $value['amount'];
            }
            $contentsService = Manager::getService("Contents");
            /*calculer le poids du colis !*/
            foreach($myCart as $item) {
                $content = $contentsService->findById($item['productId'], true, false);
                if($content['fields']['weight']) $cartWeight += $content['fields']['weight'] * $item['amount'];
                else if($content['productProperties']['variations'] && $content['productProperties']['variations'][0]['weight']){
                    foreach($content['productProperties']['variations'] as $variation) {
                        if(variation['id'] == $item['variationId']) $cartWeight+= $variation['weight'] * $item['amount'];
                    }
                }
            }
            foreach ($response['result'] as $key => &$value) {
                $value['shipperId'] = (string)$value['shipperId'];
                //si le poids est 0 => seulement téléchargement
                //if($cartWeight == 0 && $value['shipperId'] !="57c68a39245640e52b8c02c0") unset($response['result'][$key]);
                
                $value = array_merge($value, $value['rates']);
                unset ($value['rates']);
                if ($value['rateType'] == 'flatPerItem') {
                    $value['rate'] = $value['rate'] * $items;
                }
                if ($value['rateType'] == 'flatPerWeight') {
                    //si prix fixe par tranche de poids, renvoyer seulement le shipper avec les bonnes limites de poids
                    if($cartWeight<$value['limitMin'] || $cartWeight>=$value['limitMax']) unset($response['result'][$key]);
                }
            }
            return array(
                "data" => $response['result'],
                "total" => count($response['result']),
                "success" => true
            );
        } else {
            return array(
                "msg" => $response['errmsg'],
                "success" => false
            );
        }
    }

    /**
     * Find by ID and merge current country at root of array
     *
     * @param $id
     * @param $country
     * @return array
     *
     * @see \Rubedo\Interfaces\Collection\IShippers::findByIdAndWindApplicable
     */
    public function findByIdAndWindApplicable($id, $country)
    {
        $finded = $this->findById($id);
        foreach ($finded['rates'] as $rate) {
            if ($rate['country'] == $country) {
                $finded = array_merge($finded, $rate);
            }
        }
        return $finded;
    }
}
