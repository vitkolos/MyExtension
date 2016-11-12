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
        $query = array();
        $query['currency_code'] = 'EUR'; //devise
        $query['lc'] = 'FR'; // langue
        $query['return'] = "http://" . $_SERVER['HTTP_HOST'];
        $query['notify_url'] = 'http://musculine.fr';
        
        
        $query['cmd'] = '_cart';
        $query['upload'] = '1';
        $query['business'] ='magasin.henri4-facilitator@chemin-neuf.org';
        
        

        
        $output['url']=$parametres;
        $output['whatToDo']="submitPaypalForm";
        return $output;
    }
}