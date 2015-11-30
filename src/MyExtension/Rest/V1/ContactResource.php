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

namespace RubedoAPI\Rest\V1;


use Rubedo\Services\Manager;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use RubedoAPI\Exceptions\APIControllerException;

/**
 * Class ContactResource
 * @package RubedoAPI\Rest\V1
 */
class ContactResource extends AbstractResource
{
    /**
     * { @inheritdoc }
     */
    function __construct()
    {
        parent::__construct();
        $this
            ->definition
            ->setName('Contact')
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
                            ->setKey('mailingListId')
                            ->setRequired()
                            ->setDescription('ID of the mailing list to target')
                            ->setFilter('\MongoId')
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
        /** @var \Rubedo\Interfaces\Collection\IMailingList $mailingListsService */
        $mailingListsService = Manager::getService('MailingList');
        /** @var \Rubedo\Interfaces\Mail\IMailer $mailerService */
        $mailerService = Manager::getService('Mailer');

        $mailingList = $mailingListsService->findById($params['mailingListId']);
        if (empty($mailingList) || empty($mailingList['replyToAddress']))
            throw new APIControllerException('Can\'t find recipient', 404);
        $mailerObject = $mailerService->getNewMessage();

        $destinataires=$this->buildDest($params['to']);
        $senderMail=$params['from'];
        $senderDomain = explode("@", $senderMail);
        if($senderDomain[1] != "chemin-neuf.org"){
            $senderMail = "web@chemin-neuf.org";
        }
        $from = array($senderMail => $params['from']);
        if (empty($mailingList['replyToName']))
            array_push($destinataires, $mailingList['replyToAddress']);
            /*$mailerObject->setTo($mailingList['replyToAddress']);*/
        else {
            $destinataires[$mailingList['replyToAddress']] = $mailingList['replyToName'];
            /*$mailerObject->setTo([$mailingList['replyToAddress'] => $mailingList['replyToName'], "nicolas.rhone@gmail.com" => "Nicolas Rhoné"]);*/
        }
        $mailerObject->setTo($destinataires);
        $mailerObject->setFrom(array($params['from'] => $params['from']));
        $mailerObject->setSubject($params['subject']);
        if ($params['template'] == null) $mailerObject->setBody($this->buildEmail($params['fields']), 'text/html', 'utf-8');
        else $mailerObject->setBody($this->buildEmailFromTemplate($params['fields'],$params['template'],$params['subject']), 'text/html', 'utf-8');
        $mailerObject->setReplyTo(array($params['from'] => $params['from']));
        
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


}
