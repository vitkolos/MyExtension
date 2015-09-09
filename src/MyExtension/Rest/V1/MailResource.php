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

namespace MyExtension\Rest\V1;


use Rubedo\Services\Manager;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use RubedoAPI\Rest\V1\AbstractResource;
use RubedoAPI\Exceptions\APIControllerException;

/**
 * Class MailResource
 * @package RubedoAPI\Rest\V1
 */
class MailResource extends AbstractResource
{
    /**
     * { @inheritdoc }
     */
    function __construct()
    {
        parent::__construct();
        $this
            ->definition
            ->setName('Mail')
            ->setDescription('Send an email to contact')
            ->editVerb('post', function (VerbDefinitionEntity &$entity) {
                $entity
                    ->setDescription('Send an email')
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('fields')
                            ->setRequired()
                            ->setMultivalued()
                            ->setDescription('Fields to send')
                            ->setFilter('string')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('from')
                            ->setRequired()
                            ->setDescription('Sender is required')
                            ->setFilter('validate_email')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('to')
                            ->setRequired()
                            ->setDescription('Mail is required')
                    )
                   ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('template')
                            ->setDescription('Template for email')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('subject')
                            ->setRequired()
                            ->setDescription('Subject is required')
                            ->setFilter('string')
                    );
            });
    }

    /**
     * Post to contact
     *
     * @param $params
     * @return array
     * @throws \RubedoAPI\Exceptions\APIControllerException
     */
    public function postAction($params)
    {
        /** @var \Rubedo\Interfaces\Mail\IMailer $mailerService */
        $mailerService = Manager::getService('Mailer');

        $mailerObject = $mailerService->getNewMessage();

        /*$destinataires=$this->buildDest($params['to']);*/
        $destinataires=array($params['to']);
        $from = array($params['from']);
 
        $mailerObject->setTo($destinataires);
        $mailerObject->setFrom($from);
        //$mailerObject->setReplyTo(array($from => $params['fields']['name']));
        $mailerObject->setSubject($params['subject']);
        if ($params['template'] == null) $mailerObject->setBody($this->buildEmail($params['fields']));
        else $mailerObject->setBody($this->buildEmailFromTemplate($params['fields'],$params['template'],$params['subject']), 'text/html', 'utf-8');


        
        
        // Send e-mail
        $errors = [];
        if ($mailerService->sendMessage($mailerObject, $errors)) {
            return [
                'success' => true,
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Error encountered, more details in "errors"',
                'errors' => $errors,
            ];
        }
    }

    /**
     *
     * Build email corpus from fields array
     *
     * @param $fields
     * @return string
     */
    protected function buildEmailFromTemplate($fields,$template,$subject)
    {
        
         $body =file_get_contents("http://vps112595.ovh.net".$template);
          foreach ($fields as $name => $content) {
            $body = preg_replace("~{".$name."}~i", $content, $body);
        }
       
        /*foreach ($fields as $name => $content) {
            $lines[] = $name . ' : ' . $content;
        }*/
        return $body;
    }
    
    
    protected function buildEmail($fields)
    {
        $lines = [];
        foreach ($fields as $name => $content) {
            $lines[] = $name . ' : ' . $content;
        }
        return implode("\n", $lines);
    }
   /**
     *
     * Build email corpus from fields array
     *
     * @param $fields
     * @return string
     */
    protected function buildDest($destinataires)
    {
        $emails = array();;
        foreach ($destinataires as $name => $email) {
            $emails[$email] = $name;
        }
        return $emails;
    }


}
