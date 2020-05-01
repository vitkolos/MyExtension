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


use Rubedo\Collection\AbstractLocalizableCollection;
use RubedoAPI\Exceptions\APIAuthException;
use RubedoAPI\Exceptions\APIEntityException;
use RubedoAPI\Exceptions\APIRequestException;
use WebTales\MongoFilters\Filter;
use Rubedo\Content\Context;

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
    public function __construct()
        {
            parent::__construct();
            $this->define();
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
        $this->log("starting new email params = " . json_encode($params));
        /** @var \Rubedo\Interfaces\Mail\IMailer $mailerService */
        $mailerService = Manager::getService('Mailer');

        $mailerObject = $mailerService->getNewMessage();

        /*$destinataires=$this->buildDest($params['to']);*/
        $destinataires=array($params['to']);

        // for ephata, we send the mail also to web@chemin-neuf.org
        if ($params['to'] == 'ephata@chemin-neuf.org') $destinataires[] = 'web@chemin-neuf.org';

        $senderMail=$params['from'];
        $senderDomain = explode("@", $senderMail);
        if($senderDomain[1] != "chemin-neuf.org"){
            $senderMail = "web@chemin-neuf.org";
        }
        $from = array($senderMail => $params['fields']['name']);
 
        $mailerObject->setTo($destinataires);
        $mailerObject->setReplyTo(array($params['from'] => $params['fields']['name']));
        $mailerObject->setFrom($from);
        $mailerObject->setCharset('utf-8');
        $mailerObject->setSubject($params['subject']);
        if (!$params['template']) {
            $myBody = $this->buildEmail($params['fields']);
            $mailerObject->setBody($myBody, 'text/html', 'utf-8');
            $this->log("no email template specified message body = " . str_replace("\n", "@@", $myBody));
        } else {
            $myBody = $this->buildEmailFromTemplate($params['fields'],$params['template'],$params['subject']);
            $this->log("email template from ".$params['template']);
            $mailerObject->setBody($myBody, 'text/html', 'utf-8');
        }
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
     * Email d'inscription
     *
     * @param $params
     * @return array
     * @throws \RubedoAPI\Exceptions\APIControllerException
     */
    public function getAction($params)
    {
        /** @var \Rubedo\Interfaces\Mail\IMailer $mailerService */
        $mailerService = Manager::getService('Mailer');

        $mailerObject = $mailerService->getNewMessage();

        /*$inscription=$params['inscription'];
        $traductions = $params['traductions']);
        $mailSecretariat = $inscription['mailSecretariat'];
        $mailInscrit = $inscription['email'];




 
        $mailerObject->setTo($destinataires);
        $mailerObject->setReplyTo($from);
        $mailerObject->setFrom($from);
        $mailerObject->setCharset('utf-8');
        $mailerObject->setSubject($params['subject']);
        if ($params['template'] == null) $mailerObject->setBody($this->buildEmail($params['fields']), 'text/html', 'utf-8');
        else $mailerObject->setBody($this->buildEmailFromTemplate($params['fields'],$params['template'],$params['subject']), 'text/html', 'utf-8');
        // Send e-mail
        $errors = [];*/
        if(true){//if ($mailerService->sendMessage($mailerObject, $errors)) {
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
        $url = 'http://' . $_SERVER['HTTP_HOST'] . $template;
        $ctx = stream_context_create([
            'ssl' => ['verify_peer' => false], // verify_peer = false means "don't verify the SSL certificate"
            'http' => ['ignore_errors' => true],
        ]);
        $body = file_get_contents($url, FALSE, $ctx);
        foreach ($fields as $name => $content) {
            $body = preg_replace('{{ '.$name.' }}', $content, $body);
        }
        return $body;
    }
    
    
    protected function buildEmail($fields)
    {
        $lines = [];
        foreach ($fields as $name => $content) {
            $lines[] = $name . ' : ' . $content;
        }
        return implode("<br/>", $lines);
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

    
    
    
    /**
     * Define verbs
     */
    protected function define()
    {
        $this->definition
            ->setName('Mail')
            ->setDescription('Envoi de mails')
            ->editVerb('post', function (VerbDefinitionEntity &$verbDef) {
                $this->definePost($verbDef);
            })
            ->editVerb('get', function (VerbDefinitionEntity &$definition) {
                $this->defineGet($definition);
            });
        
    }
    /**
     * Define post
     *
     * @param VerbDefinitionEntity $verbDef
     */
    protected function definePost(VerbDefinitionEntity &$verbDef)
    {
        $verbDef
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
    }    
     /**
     * Define get
     *
     * @param VerbDefinitionEntity $verbDef
     */
    protected function defineGet(VerbDefinitionEntity &$verbDef)
    {
        $verbDef
                    ->setDescription('Send an email for registration')
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('inscription')
                            ->setRequired()
                            ->setMultivalued()
                            ->setDescription('Résultats du formulaire')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('traductions')
                            ->setRequired()
                            ->setDescription('Traductions')
                    );
    }

    private function log($msg) {
        $log_file_path = '/var/www/html/rubedo/log/mailer_resource.log';
        if (gettype($msg) != 'string') $msg = json_encode($msg);
        file_put_contents($log_file_path, date("Y-m-d H:i") . ' ' . $msg . "\n", FILE_APPEND | LOCK_EX);
    }
   
    
    
    

}
