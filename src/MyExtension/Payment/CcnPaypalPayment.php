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
class CcnPaypalPayment extends AbstractPayment
{
    public function __construct()
    {
        $this->paymentMeans = 'paypal';
        parent::__construct();
    }
    public function getOrderPaymentData($order,$currentUserUrl)
    {
        $params = array();
        $params['currency_code'] = 'EUR'; //devise
        $params['lc'] = 'FR'; // langue
        $params['return'] = "http://" . $_SERVER['HTTP_HOST'];
        $params['notify_url'] = "http://" . $_SERVER['HTTP_HOST'] . "/api/v1/ecommerce/payments/paypal";
        
        //var_dump($order);
        $params['cmd'] = '_cart';
        $params['upload'] = '1';
        $params['business'] =$this->nativePMConfig['userEmail'];
        $params['currency_code'] = "EUR";
        
        foreach($order['detailedCart']['cart'] as $key => $product){
            $params['item_name_'.($key+1)] = $product['title'];
            $params['item_number_'.($key+1)] = $product['productId'];
            $params['amount_'.($key+1)] = $product['unitPrice'];
            $params['quantity_'.($key+1)] = $product['amount'];
            $params['tax_rate_'.($key+1)] = ($product['taxedPrice']-$product['price'])*100/$product['price'];
            if(count($product['variationProperties'])>0) {
                $params['on0_'.($key+1)] = "";
                foreach($product['variationProperties'] as $variationProperty){
                    $params['on0_'.($key+1)] .=$variationProperty." ";
                }
            }
            
        }
        //$params['tax_cart'] = $order['detailedCart']['totalTaxedPrice'] -  $order['detailedCart']['totalPrice'];
        //$params['tax'] = $order['detailedCart']['totalTaxedPrice'] -  $order['detailedCart']['totalPrice'];
        //$params['shipping_cart'] = $order['shippingPrice'];
        $params['shipping_1'] = $order['shippingTaxedPrice'];
        $params['charset']="utf-8";
        $output['url']=$params;
        $output['whatToDo']="submitPaypalForm";
        return $output;
    }
}