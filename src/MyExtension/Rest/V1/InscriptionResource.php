<?php
namespace RubedoAPI\Rest\V1;

use RubedoAPI\Rest\V1\AbstractResource;
use Rubedo\Services\Manager;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use WebTales\MongoFilters\Filter;
class InscriptionResource extends AbstractResource
{
    /**
     * native config for this payment means
     *
     * @var array
     */
    public function __construct()
    {
        parent::__construct();
        $this
            ->definition
            ->setName('Inscription')
            ->setDescription('Service d\'inscription')
            ->editVerb('post', function (VerbDefinitionEntity &$verbDefinitionEntity) {
                $verbDefinitionEntity
                    ->setDescription('Get résultats du formulaire d\'inscription')
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Inscription')
                            ->setKey('inscription')                            
                    )
                     ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('workspace')
                            ->setRequired()
                            ->setDescription('Workspace')
                    )
                     ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('traductions')
                            ->setDescription('Traductions')
                    )
                     ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Numéro d\'inscription')
                            ->setKey('id')
                    );
            });
    }
    public function postAction($params)
    {
        //$language = preg_replace('%^/(\w+?)/.*$%', '$1', $_SERVER["REQUEST_URI"]); // langue du site
        //var_dump($language);
        //authentication comme admin inscriptions
        $auth = $this->getAuthAPIService()->APIAuth('admin_inscriptions', '2qs5F7jHf8KD');
        $output['token'] = $this->subTokenFilter($auth['token']);
        $token = $output['token']['access_token'];
        
        
        //GET NUMERO D'INSCRIPTION ACTUEL
        $id = "5625176445205e6b03832548"; // id du contenu "Numéro d'inscription"
        $nbInscriptionContent = $this->callAPI("GET", $token, $id);
        if($nbInscriptionContent['success']) {
            $nbInscriptionContent = $nbInscriptionContent['content'];
            $inscriptionNumber = (int)$nbInscriptionContent['fields']['value'] +1;
        }
        else throw new APIEntityException('Content not found', 404);
        
        
        $nbInscriptionContent['fields']['value'] = (string)$inscriptionNumber;

        //UPDATE NUMERO D'INSCRIPTION +1
        $payload = json_encode( array( "content" => $nbInscriptionContent ) );
        $result = $this->callAPI("PATCH", $token, $payload, $id);
        
        //PREPARE INSCRIPTION
        $inscriptionForm=[];
        $inscriptionForm['fields'] =  $params['inscription'];
        $inscriptionForm['fields']['text'] = "". $this->getPays()."_".(string)$inscriptionNumber;
        $inscriptionForm['writeWorkspace'] = $params['workspace'];
        $inscriptionForm['typeId'] = "561627c945205e41208b4581";
        $inscriptionForm['fields'] = $this->processInscription($inscriptionForm['fields']);
                //GET SECRETARIAT
        if($inscriptionForm['fields']['contact']){
            $mailSecretariat = $this->callAPI("GET", $token, $inscriptionForm['fields']['contact']);
            if($mailSecretariat['success']) {$inscriptionForm['fields']['mailSecretariat'] = $mailSecretariat['content']['fields']['email'];}
            else $inscriptionForm['fields']['mailSecretariat'] = "sessions@chemin-neuf.org";
        }
        
        //CREATE INSCRIPTION IN DATABASE
        $payload2 = json_encode( array( "content" => $inscriptionForm ) );
        $resultInscription = $this->callAPI("POST", $token, $payload2);
        
        if($resultInscription['success']) {$this->sendInscriptionMail($inscriptionForm['fields'], $_GET["lang"]);}
       
       
    
        return array('success' => $resultInscription['success'], 'id' =>$inscriptionForm['fields']['text']);
        
   }
   
   
protected function sendInscriptionMail($inscription,$lang){
   $trad = json_decode(file_get_contents('http://' . $_SERVER['HTTP_HOST'] .'/assets/mails/'.$lang.'.json'),true);
    var_dump($trad);
    /*tutoyement pour ados ou jeunes ou personnes connues*/
    $tutoyer = 0; $tuOuVous="vous";
    if($inscription['public_type'] == 'adolescent' || $inscription['public_type'] == 'jeune-adulte' || $inscription['personneConnue']) {
        $tutoyer = 1; $tuOuVous="tu";
    }
    /*nombre de personnes inscrites*/
    $nbInscrits = 1;
    /*nom pour le mail aux inscrits*/
    if($inscription['prenomPers2']!="" && $inscription['prenomPers2'])  {
        $nbInscrits = 2;
        if(!$inscription['nomPers2'] || $inscription['nomPers2']="" || $inscription['nomPers2'] == $inscription['name'])
            $nomClient = $inscription['surname'] +" "+ $trad["et"] + " " +$inscription['prenomPers2'] + " " + $inscription['name'];
        else
            $nomClient = $inscription['surname'] +" " + $inscription['name']+ $trad["et"] + " " +$inscription['prenomPers2'] + " " + $inscription['nomPers2'];    
    }
    else {
        $nomClient = $inscription['surname'] +" "+ $inscription['name'];
    }    
    $alternative_a_Nous_avons_bien_recu = $inscription['mailInscription'];
    $alternative_a_Nous_avons_bien_recu_Serviteur = $inscription['mailInscriptionService'];
    
    $messageClient="";
    $messageSecretariat="";
    
    /*SALUTATION*/
    if($tutoyer || $inscription['personneConnue']) {
        $messageClient.="<p>".$trad["ccn_mail_1_tu"]." ".$inscription['surname'] ;// Bonjour Anne 
        if($nbInscrits==2) $messageClient.= " " . $trad["et"] . " " . $inscription['prenomPers2']; //et Patrick
    else $messageClient = "<p>".$trad["ccn_mail_1_vous"];//Madame, monsieur pour vouvoyement
    $messageClient.= ",<br/><br/>";
    
     #suivi = "Ton numéro d'inscription est " + idInscription + "<br><br>"
    $messageClient .= $trad["ccn_mail_3_".$tuOuVous] . $inscription['text'] . "<br/><br/>";
    
    
    
    
    
    
    
    
    
    
 
        //MAILER SERVICE
        $mailerService = Manager::getService('Mailer');
        $mailerObject = $mailerService->getNewMessage();


 
        $mailerObject->setTo('nicolas.rhone@gmail.com');
        $mailerObject->setFrom(array( $inscription['email'] => ($inscription['surname']." ".$inscription['name'])));
        $mailerObject->setReplyTo(array($inscription['email'] => ($inscription['surname']." ".$inscription['name'])));
        $mailerObject->setCharset('utf-8');
        $mailerObject->setSubject("Inscription");
        $mailerObject->setBody($messageClient, 'text/html', 'utf-8');
        $errors = [];
        $mailerService->sendMessage($mailerObject, $errors);
}















   

    
    protected function subTokenFilter(&$token)
    {
        return array_intersect_key($token, array_flip(array('access_token', 'refresh_token', 'lifetime', 'createTime')));
    }
    
    protected function processInscription($inscription) {
        //dates
        $inscription['birthdate'] = strtotime($inscription['birthdate']);
        if($inscription['dateNaissPers2']) $inscription['dateNaissPers2'] = strtotime($inscription['dateNaissPers2']);
        if($inscription['logement']) {
            $inscription['logement'] = $this->questionToAnswer($inscription['logement']);
        }
        if($inscription['transport']) {
            $inscription['transport'] = $this->questionToAnswer($inscription['transport']);
        }
        if($inscription['complementaire']) {
            $inscription['complementaire'] = $this->questionToAnswer($inscription['complementaire']);
        }        
        if($inscription['jai_connu']){
            $inscription['jai_connu'] = $this->questionToAnswer($inscription['jai_connu'], false);
        }
        if($inscription['autreSituation']){
            $inscription['situation'] .= " : ".$inscription['autreSituation'];
        }
        if($inscription['enfants']){
            foreach ($inscription['enfants'] as $index => $enfant){
                $inscription['enfants'][$index] = $enfant[prenom]. " ".strtoupper($enfant[nom])." ; ".$enfant['birthdateF']." ; ".$enfant['sexe'];
            }
        }
        if($inscription['prenomPers2']&&$inscription['prenomPers2']!="") {
            $inscription['sexePers2'] = "F";
            $inscription['sexe'] = "H";
        }
        

        return $inscription;
        
    }
    protected function questionToAnswer($question, $printTitre = true){
            $answer="";
            foreach ($question as $titre => $reponse){
                if($printTitre) $answer .= $titre." = ";
                if(is_string($reponse)) $answer.= $reponse; // pour texte ou radio
                else {
                    foreach($reponse as $value) $answer .= $value.", ";
                }
                if($printTitre) $answer.="; ";
                
            }
            return $answer;
        
    }
    protected function formatTelephone($number){
            $answer="";
            foreach ($question as $titre => $reponse){
                if($printTitre) $answer .= $titre." = ";
                if(is_string($reponse)) $answer.= $reponse; // pour texte ou radio
                else {
                    foreach($reponse as $value) $answer .= $value.", ";
                }
                if($printTitre) $answer.="; ";
                
            }
            return $answer;
        
    }
    
    protected function getPays(){
        switch($_SERVER['HTTP_HOST']) {
            case "ccn.chemin-neuf.fr" : 
                return "FR"; break;
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
   
}     




