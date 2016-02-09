<?php
namespace MyExtension\Rest\V1;
use Rubedo\Services\Manager;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use RubedoAPI\Rest\V1\AbstractResource;
use RubedoAPI\Exceptions\APIControllerException;
use WebTales\MongoFilters\Filter;


class PayboxIpnResource extends AbstractResource {
    protected $returnedEntityFields = array(
        'fields'
    );
    protected $_dataService;
    protected $_collectionName;
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
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Signature')
                            ->setKey('signature')
                            ->setFilter('string')
                            ->setRequired()
                    )
                    ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('message general')
                            ->setKey('message')
                    )
                    ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription("message d'erreur de l'envoi de mail")
                            ->setKey('errors')
                    )
                    ;
            });
    }
    function getAction($params) {
        $securite = true; $autorisation = false;$erreurStatus = true; $erreurMessage="";
        //VERIFICATIONS PAYBOX
        //code d'erreur
        if($params['erreur'] == "00000") $erreurStatus = false;
        else $erreurMessage = $this->getErrorMessage($params['erreur']);
          
        //autorisation
       if($params['autorisation'] && $params['autorisation']!="") $autorisation = true;
        else $erreurMessage .= " Pas d'autorisation de Paybox. ";
        
                $mailCompta = $this->getMailCompta();
        $mailerService = Manager::getService('Mailer');

        $mailerObject = $mailerService->getNewMessage();

        $destinataires=array($mailCompta); // set $mailSecretariat
        $replyTo="web@chemin-neuf.org";
        $from="web@chemin-neuf.org";
        
        $erreur = $params['erreur'];
        if ($erreur == "00000") {
            $sujet = "Réception d'un paiement en ligne";
        }
        else {
            $sujet = "Échec paiement en ligne";
        }
        if ($erreur == "00000") {
            $body = "Montant payé : " . $params['montant']/100 . " euros.\n" ;
            $body .= "Proposition : " . $inscription['fields']['propositionTitre']."\n";
            $body .= "Code Onesime : " . $inscription['fields']['codeOnesime']."\n";
            $body .= "Code Compta : " . $inscription['fields']['codeCompta']."\n";
            $body .= "Id Inscription : " . $inscription['fields']['text']."\n";
            $body .= "Nom : " . $inscription['fields']['name']."\n";
            $body .= "Prénom : " . $inscription['fields']['surname']."\n";
             $body .= "Email : " . $inscription['fields']['email']."\n";
            if($erreurMessage!="") $body.="\n\n Message : " . $erreurMessage;
        }
        else {
            $body = "Montant non payé : " . $params['montant']/100  . " euros." ;
            $body.="\n\n Raisons de l'échec : ".$erreurMessage;
        }
        $body = $body . " \n\n " . $params['commande'];
        
        $mailerObject->setTo($destinataires);
        $mailerObject->setFrom($from);
        $mailerObject->setSubject($sujet);
        $mailerObject->setReplyTo($replyTo);
        $mailerObject->setBody($body);

        // Send e-mail
        if ($mailerService->sendMessage($mailerObject, $errors)) {
            return [
                'success' => true,
                'message' => $body,
                'errors' =>$_SERVER
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Error encountered, more details in "errors"',
                'errors' => $erreurMessage
            ];
        }
    }


    protected function getMailCompta(){
        switch($_SERVER['HTTP_HOST']) {
            case "ccn.chemin-neuf.fr" : 
                return "nicolas.rhone@wanadoo.fr"; break;
        }
    }
     

    
    
        protected function callAPI($method, $token, $data = false, $id=false) {
        $curl = curl_init();
    
        switch ($method)
        {
            case "POST": // pour créer un contenu
                curl_setopt($curl, CURLOPT_POST, 1);
                $url = 'http://' . $_SERVER['HTTP_HOST'] . '/api/v1/contents?access_token='.$token.'&lang=fr';
                if ($data)
                    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                break;
            case "PATCH": // pour modifier un contenu (numéro d'inscription)
                curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'PATCH');
                if($id)
                    $url = 'http://' . $_SERVER['HTTP_HOST'] . '/api/v1/contents/'.$id.'?access_token='.$token.'&lang=fr';
                if ($data)
                    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                break;
            case "GET":
                $url = 'http://' . $_SERVER['HTTP_HOST'] . '/api/v1/contents/'.$data.'?access_token='.$token.'&lang=fr';
                break;
            
        }
    
    
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);  // Follow the redirects (needed for mod_rewrite)
        curl_setopt($curl, CURLOPT_FRESH_CONNECT, true);   // Always ensure the connection is fresh
        curl_setopt( $curly, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
        curl_setopt($curl, CURLOPT_ENCODING, 'windows-1252');
        $result = curl_exec($curl);
    
        curl_close($curl);
        if($method == "GET") return json_decode($result, true);
        else return json_decode($result, true);
    }


    public function getErrorMessage($error) {
        $message="";
        switch($error) {
            case "00001" : $message = "La connexion au centre d’autorisation a échoué ou une erreur interne est survenue. Dans ce cas, il est souhaitable de faire une tentative sur le site secondaire : tpeweb1.paybox.com."; break;
            case "00003" : $message = "Erreur Paybox. Dans ce cas, il est souhaitable de faire une tentative sur le site secondaire FQDN tpeweb1.paybox.com."; break;
            case "00004" : $message = "Numéro de porteur ou cryptogramme visuel invalide."; break;
            case "00006" : $message = "Accès refusé ou site/rang/identifiant incorrect."; break;
            case "00008" : $message = "Date de fin de validité incorrecte."; break;
            case "00009" : $message = "Erreur de création d’un abonnement."; break;
            case "00010" : $message = "Devise inconnue."; break;
            case "00011" : $message = "Montant incorrect."; break;
            case "00015" : $message = "Paiement déjà effectué."; break;
            case "00016" : $message = "Abonné déjà existant (inscription nouvel abonné). Valeur ‘U’ de la variable PBX_RETOUR."; break;
            case "00021" : $message = "Carte non autorisée."; break;
            case "00029" : $message = "Carte non conforme. Code erreur renvoyé lors de la documentation de la variable « PBX_EMPREINTE »."; break;
            case "00030" : $message = "Temps d’attente > 15 mn par l’internaute/acheteur au niveau de la page de paiements."; break;
            case "00031" : $message = "Réservé."; break;
            case "00032" : $message = "Réservé."; break;
            case "00033" : $message = "Code pays de l’adresse IP du navigateur de l’acheteur non autorisé."; break;
            case "00040" : $message = "Opération sans authentification 3-DSecure, bloquée par le filtre."; break;
            case "99999" : $message = "Opération en attente de validation par l’émetteur du moyen de paiement."; break;
            case "00032" : $message = "Réservé."; break;
            case "00032" : $message = "Réservé."; break;
            case "00032" : $message = "Réservé."; break;
            case "00100": $message = "Transaction approuvée ou traitée avec succès"; break;
            case "00101": $message =  "Contacter l’émetteur de carte"; break;
            case "00102": $message = "Contacter l’émetteur de carte"; break;
            case "00103": $message = "Commerçant invalide"; break;
            case "00104": $message = "Conserver la carte"; break;
             case "00105": $message = "Ne pas honorer"; break;
            case "00107": $message = "Conserver la carte, conditions spéciales"; break;
            case "00108": $message = "Approuver après identelification du porteur"; break;
            case "00112": $message = "Transaction invalide"; break;
            case "00113": $message = "Montant invalide"; break;
            case "00114": $message = "Numéro de porteur invalide"; break;
            case "00115": $message = "Emetteur de carte inconnu"; break;
            case "00117": $message = "Annulation client"; break;
            case "00119": $message = "Répéter la transaction ultérieurement"; break;
            case "00120": $message = "Réponse erronée (erreur dans le domaine serveur)"; break;
            case "00124": $message = "Mise à jour de fichier non supportée"; break;
            case "00125": $message = "Impossible de localiser l’enregistrement dans le fichier"; break;
            case "00126": $message = "Enregistrement dupliqué, ancien enregistrement remplacé"; break;
            case "00127": $message = "Erreur en « edit » sur champ de mise à jour fichier"; break;
            case "00128": $message = "Accès interdit au fichier"; break;
            case "00129": $message = "Mise à jour de fichier impossible"; break;
            case "00130": $message = "Erreur de format"; break;
            case "00133": $message = "Carte expirée"; break;
            case "00138": $message =  "Nombre d’essais code confidentiel dépassé"; break;
            case "00141": $message =  "Carte perdue"; break;
            case "00143": $message =  "Carte volée"; break;
            case "00151": $message =  "Provision insuffisante ou crédit dépassé"; break;
            case "00154": $message =  "Date de validité de la carte dépassée"; break;
            case "00155": $message =  "Code confidentiel erroné"; break;
            case "00156": $message =  "Carte absente du fichier"; break;
            case "00157": $message =  "Transaction non permise à ce porteur"; break;
            case "00158": $message =  "Transaction interdite au terminal"; break;
            case "00159": $message =  "Suspicion de fraude"; break;
            case "00160": $message =  "L’accepteur de carte doit contacter l’acquéreur"; break;
            case "00161": $message =  "Dépasse la limite du montant de retrait"; break;
            case "00163": $message =  "Règles de sécurité non respectées"; break;
            case "00168": $message =  "Réponse non parvenue ou reçue trop tard"; break;
            case "00175": $message =  "Nombre d’essais code confidentiel dépassé"; break;
            case "00176": $message =  "Porteur déjà en opposition, ancien enregistrement conservé"; break;
            case "00189": $message =  "Echec de l’authentelification"; break;
            case "00190": $message =  "Arrêt momentané du système"; break;
            case "00191": $message =  "Emetteur de cartes inaccessible"; break;
            case "00194": $message =  "Demande dupliquée"; break;
            case "00196": $message =  "Mauvais fonctionnement du système"; break;
            case "00197": $message =  "Echéance de la temporisation de surveillance globale"; break;
            default : $message = "Erreur non documentée";
        }
        return $message;
    }
    
    protected function subTokenFilter(&$token)
    {
        return array_intersect_key($token, array_flip(array('access_token', 'refresh_token', 'lifetime', 'createTime')));
    }
    
    public function getContentIdByName($name){
        $contentId = (string)$id;
        $className = (string)get_class($this);

        $this->_dataService = Manager::getService('MongoDataAccess');
        $this->_dataService->init("Contents");
        $content = $this->_dataService->findByName($name);
        if (empty($content)) {
            throw new APIEntityException('Content not found', 404);
        }
        return $content['id'];
    }    
} 
