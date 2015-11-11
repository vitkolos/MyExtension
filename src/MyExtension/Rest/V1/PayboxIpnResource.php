<?php
namespace MyExtension\Rest\V1;
use Rubedo\Services\Manager;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use RubedoAPI\Rest\V1\AbstractResource;
use RubedoAPI\Exceptions\APIControllerException;


class PayboxIpnResource extends AbstractResource {
    function __construct()
    {
        parent::__construct();
        $this
            ->definition
            ->setName('PayboxIpn')
            ->setDescription('Paybox IPN')
            ->editVerb('get', function (VerbDefinitionEntity &$verbDefinitionEntity) {
                $verbDefinitionEntity
                    ->setDescription('Get info de paiement Paybox')
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('referencePaybox')
                            ->setKey('referencePaybox')
                            ->setFilter('string')
                            ->setRequired()
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('montant')
                            ->setKey('montant')
                            ->setFilter('string')
                            ->setRequired()
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('commande')
                            ->setKey('commande')
                            ->setFilter('string')
                            ->setRequired()
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Autorisation')
                            ->setKey('autorisation')
                            ->setFilter('string')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Pays')
                            ->setKey('pays')
                            ->setFilter('string')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('erreur')
                            ->setKey('erreur')
                            ->setFilter('string')
                            ->setRequired()
                    )

                    /*->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('message general')
                            ->setKey('message')
                    )
                    ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription("message d'erreur de l'envoi de mail")
                            ->setKey('errors')
                    )*/
                    ;
            });
    }
    function getAction($params) {
        
        $mailerService = Manager::getService('Mailer');

        $mailerObject = $mailerService->getNewMessage();

        /*$destinataires=$this->buildDest($params['to']);*/
        $destinataires="nicolas.rhone@gmail.com";
        $from="frederic.bourdeau@chemin-neuf.org";
        
        $erreur = $params['erreur'];
        if ($erreur == "00000") {
            $sujet = "callback paybox succes";
        }
        else {
            $sujet = "callback paybox echec";
        }
        if ($erreur == "00000") {
            $body = "montant payé : " . $params['montant'] . " euros." ;
        }
        else {
            $body = "montant non payé : " . $params['montant']  . " euros." ;
        }
        $body = $body . " \n\n " . $params['commande'];
        
        $mailerObject->setTo($destinataires);
        $mailerObject->setFrom($from);
        $mailerObject->setSubject($sujet);
        $mailerObject->setBody($body);

        // Send e-mail
        $errors = [];
        if ($mailerService->sendMessage($mailerObject, $errors)) {
            /*return [
                'success' => true,
                'message' => $body,
            ];*/
        } else {
            return [
                'success' => false,
                'message' => 'Error encountered, more details in "errors"',
                'errors' => $errors,
            ];
        }
    }
} 
