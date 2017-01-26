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
        $paymentConfig=Manager::getService("PaymentConfigs")->getConfigForPM("paf_fr");
        var_dump($paymentConfig);
        return array(
                    'success' => true,
                    'paymentConfig' =>$paymentConfig
                );
    }


}
