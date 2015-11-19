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
        $inscriptionForm['fields']['text'] = "". $this->getPays().(string)$inscriptionNumber;
        $inscriptionForm['writeWorkspace'] = $params['workspace'];
        $inscriptionForm['typeId'] = "561627c945205e41208b4581";
        $inscriptionForm['fields'] = $this->processInscription($inscriptionForm['fields']);
                //GET SECRETARIAT
        if($inscriptionForm['fields']['contact']){
            $mailSecretariat = $this->callAPI("GET", $token, $inscriptionForm['fields']['contact']);
            if($mailSecretariat['success']) {
                $inscriptionForm['fields']['mailSecretariat'] = $mailSecretariat['content']['fields']['email'];
                $inscriptionForm['fields']['contact'] = $mailSecretariat['content']['fields'];
            }
            else $inscriptionForm['fields']['mailSecretariat'] = "sessions@chemin-neuf.org";
            
        }
        
        //CREATE INSCRIPTION IN DATABASE
        $payload2 = json_encode( array( "content" => $inscriptionForm ) );
        $resultInscription = $this->callAPI("POST", $token, $payload2);
        //GET PAYEMENT INFOS
        if($inscriptionForm['fields']['montantAPayerMaintenant']>0) {
            $paymentMeansId = $this->getAccountId();
            $paymentMeans = $this->callAPI("GET", $token, $paymentMeansId);
            $inscriptionForm['fields']['paymentInfos'] =$paymentMeans['content']['fields'];
        }
        
        
       if($resultInscription['success']) {$this->sendInscriptionMail($inscriptionForm['fields'], $_GET["lang"]);}
       
       
    
        return array('success' => $resultInscription['success'], 'id' =>$inscriptionForm['fields']['text']);
        
   }
   
   
protected function sendInscriptionMail($inscription,$lang){
   $trad = json_decode(file_get_contents('http://' . $_SERVER['HTTP_HOST'] .'/assets/mails/'.$lang.'.json'),true);
    //tutoyement pour ados ou jeunes ou personnes connues
    $tutoyer = 0;
    $tuOuVous="vous";
    if($inscription['public_type'] == 'adolescent' || $inscription['public_type'] == 'jeune-adulte' || $inscription['personneConnue']) {
        $tutoyer = 1;
        $tuOuVous="tu";
    }
    //nombre de personnes inscrites
    $nbInscrits = 1;
    //nom pour le mail aux inscrits
    if($inscription['prenomPers2'] && $inscription['prenomPers2']!="" )  {
        $nbInscrits = 2;
        if(!$inscription['nomPers2'] || $inscription['nomPers2']=="" || $inscription['nomPers2'] == $inscription['name'])
            $nomClient = $inscription['surname'] . " " . $trad["et"] . " " . $inscription['prenomPers2'] . " " . $inscription['name'];
        else
            $nomClient = $inscription['surname'] . " " . $inscription['name'] . " " . $trad["et"] . " " . $inscription['prenomPers2'] . " " . $inscription['nomPers2'];    
    }
    else {
        $nomClient = $inscription['surname'] . " ".  $inscription['name'];
    }
    //CONTACT SECRETARIAT
    $contactSecretariat =  $inscription['contact']['text'] . " - ". $inscription['contact']['prenom']." ".$inscription['contact']['nom'] . " - " . $inscription['contact']['telephone'];
    $contactSecretariat .= " - <a href='mailto:" . $inscription['contact']['email'] . "'>" . $inscription['contact']['email'] . "</a>" ;
    $messageClient="";
    $messageSecretariat="";
        /**************SUJET CLIENT*****************/
    $sujetClient = "";
    /*Si inscriptions ouvertes*/
    if($inscription['etat'] !='liste-attente' && $inscription['etat'] !='preinscrit') {
        if($inscription['serviteur']) $sujetClient.= $trad["ccn_mail_sujet2b_serviteur"] . " - " . $inscription['propositionTitre'] ;
        else $sujetClient.= $trad["ccn_mail_sujet2b"] . " - " . $inscription['propositionTitre'];
    }
    else if($inscription['etat'] =='liste-attente') {
        if($inscription['serviteur']) $sujetClient.= $trad["ccn_mail_sujet3_serviteur"] . " - " . $inscription['propositionTitre'] ;
        else $sujetClient.= $trad["ccn_mail_sujet3"] . " - " . $inscription['propositionTitre'];        
    }
    else if($inscription['etat'] =='preinscrit') {
        if($inscription['serviteur']) $sujetClient.= $trad["ccn_mail_sujet9_serviteur"] . " - " . $inscription['propositionTitre'] ;
        else $sujetClient.= $trad["ccn_mail_sujet9"] . " - " . $inscription['propositionTitre'];        
    }
    /**************MESSAGE CLIENT*****************/
    //SALUTATION
    if($tutoyer || $inscription['personneConnue']) {
        $messageClient .="<p>".$trad["ccn_mail_1_tu"]." ".$inscription['surname'] ;// Bonjour Anne 
        if($nbInscrits==2) $messageClient.= " " . $trad["et"] . " " . $inscription['prenomPers2']; //et Patrick
    }
    else $messageClient .= "<p>".$trad["ccn_mail_1_vous"];//Madame, monsieur pour vouvoyement
    $messageClient.= ",<br/><br/>";
    
    //RECEPTION INSCRIPTION
    //Nous avons bien reçu ton inscription
    if($inscription['serviteur']) {
        if($inscription['etat'] =='liste-attente') {
            $messageClient .= ($inscription['mailInscriptionService']) ? $inscription['mailInscriptionService'] : $trad["ccn_mail_14_".$tuOuVous];
            //Nous te contacterons si des places se libèrent.
            $messageClient .= $trad["ccn_mail_15_".$tuOuVous];
        }
        if($inscription['etat'] =='preinscrit') {
            $messageClient .= ($inscription['mailInscriptionService']) ? $inscription['mailInscriptionService'] : $trad["ccn_mail_22_".$tuOuVous];
            //Nous te contacterons pour te confirmer ton inscription.
            $messageClient .= $trad["ccn_mail_21_".$tuOuVous];
        }
        else $messageClient .= ($inscription['mailInscriptionService']) ? $inscription['mailInscriptionService'] : $trad["ccn_mail_20_".$tuOuVous];
    }
    else {
        if($inscription['etat'] =='liste-attente') {
            $messageClient .= ($inscription['mailInscription']) ? $inscription['mailInscription'] : $trad["ccn_mail_14_".$tuOuVous];
            //Nous te contacterons si des places se libèrent.
            $messageClient .= $trad["ccn_mail_15_".$tuOuVous];
        }
        if($inscription['etat'] =='preinscrit') {
            $messageClient .= ($inscription['mailInscription']) ? $inscription['mailInscription'] : $trad["ccn_mail_22_".$tuOuVous];
            //Nous te contacterons pour te confirmer ton inscription.
            $messageClient .= $trad["ccn_mail_21_".$tuOuVous];
        }
        else $messageClient .= ($inscription['mailInscription']) ? $inscription['mailInscription'] : $trad["ccn_mail_10_".$tuOuVous];
    }
    $messageClient.="<br/><br/>";

    //INFOS POUR LE PAIEMENT SI PAIEMENT PROPOSE
    if($inscription['isPayment'] && $inscription['montantAPayerMaintenant'] > 0) {
        if($inscription['modePaiement'] == 'cheque') {
            //Comme convenu, nous attendons ton cheque de 60€
            $messageClient .= $trad["ccn_mail_23_".$tuOuVous] . $inscription['montantAPayerMaintenantAvecMonnaie'] . ". ";
            //Ce chèque doit être à l'ordre de ${ordre_cheque} et envoyé à l'adresse suivante
            $messageClient .= $trad["ccn_mail_24"] . "<i>" . $inscription['paymentInfos']['libelleCheque'] . "</i>" . $trad["ccn_mail_24_1"] ."<br/>";
            $messageClient .= $inscription['contact']['text'] . "<br/>" . $inscription['contact']['position']['address'] . "<br/><br/>";
            if($inscription['paiement_maintenant'] != 'accompte') {
                //Attention, ton inscription ne sera complète que quand nous aurons reçu ton chèque.
                $messageClient .= $trad["ccn_mail_30_".$tuOuVous] . "<br/><br/>";
            }
            
        }
        
        else if($inscription['modePaiement'] == 'virement') {
            //Comme convenu, nous attendons ton virement de 60€
            $messageClient .= $trad["ccn_mail_25_".$tuOuVous] . $inscription['montantAPayerMaintenantAvecMonnaie'] . ". ";
            //Tu dois te connecter à ton service bancaire en ligne ou te rendre à ta banque et effectuer un virement sur notre compte '${intitule}' dont les références sont '${compte}'.
            $messageClient .= $trad["ccn_mail_26".$tuOuVous] . "<i>" . $inscription['paymentInfos']['titreCompteVir'] . "</i>" . $trad["ccn_mail_26_1"] ." : <br/>". $inscription['paymentInfos']['ribTexte'] . "<br/>";
            /*Ajouter image RIB*/
            $messageClient .= "<center><img src='http://" . $_SERVER['HTTP_HOST']  . "/dam?media-id=" . $inscription['paymentInfos']['rib'] . "&width=300px'></center><br/>" ;
            if($inscription['paiement_maintenant'] != 'accompte') {
                //Attention, ton inscription ne sera complète que quand nous aurons reçu ton virement.
                $messageClient .= $trad["ccn_mail_31_".$tuOuVous] . "<br/><br/>";
            }            
        }
        
        else if($inscription['modePaiement'] == 'carte') {
            //Nous allons vérifier le succès de ton paiement en ligne de 60€ et tu recevras un mail de confirmation de ton paiement.
            $messageClient .= $trad["ccn_mail_27_".$tuOuVous] . $inscription['montantAPayerMaintenantAvecMonnaie'] . $trad["ccn_mail_27_1".$tuOuVous] ."<br/><br/>";
            if($inscription['paiement_maintenant'] != 'accompte') {
                //Attention, ton inscription ne sera complète que quand ton paiement en ligne aura été confirmé.
                $messageClient .= $trad["ccn_mail_32_".$tuOuVous] . "<br/><br/>";
            }            
        }
        # si le montant total à payer n'a pas été défini, il a été mis à 0 et alors, on n'affiche pas la ligne suivante
        if ($inscription['montantTotalAPayer'] && ($inscription['montantTotalAPayer'] >0) ) {
            //Nous te rappelons que d'après le choix que tu as fais, ta participation totale est de 120€. 
            $messageClient .= $trad["ccn_mail_28_".$tuOuVous] . $inscription['montantTotalAPayerAvecMonnaie'] . ".<br/><br/>";
        }
            
    }
    
    // NUMERO D'INSCRIPTION POUR SUIVI
     //"Ton numéro d'inscription est " + idInscription + "<br><br>"
    $messageClient .= $trad["ccn_mail_3_".$tuOuVous] . $inscription['text'] . ".<br/><br/>";
    
    
    // NOTES SUPPLEMENTAIRES (ENTRETIEN / LETTRES / PDF A REMPLIR)
    if($inscription['motivation'] && !$inscription['formulaire_pdf']) {
        //Nous te rappelons que pour que ton inscription soit complète, tu dois envoyer une lettre de motivation à l'adresse suivante
        if($inscription['public_type'] == 'couple' || $inscription['public_type'] == 'famille' || $inscription['public_type'] == 'fiances')
            $messageClient .= $trad["ccn_mail_5_couple"] . " :<br/>";
        else $messageClient .= $trad["ccn_mail_5_".$tuOuVous] . " :<br/>";
    }
    
    if(!$inscription['motivation'] && $inscription['formulaire_pdf']) {
        //Nous te rappelons que pour que ton inscription soit complète, tu dois imprimer le formulaire complémentaire ( formulaire ), le remplir à la main et l'envoyer à l'adresse suivante" 
        $messageClient.= $trad["ccn_mail_6_".$tuOuVous]
                . "<a href='http://" . $_SERVER['HTTP_HOST'] . $inscription['formulaire_pdf']['url'] ."'>" . $inscription['formulaire_pdf']['title'] ."</a>"
                . $trad["ccn_mail_6_1_".$tuOuVous] . " :<br/>" ;
    }
    if($inscription['motivation'] && $inscription['formulaire_pdf']) {
        //Nous te rappelons que pour que ton inscription soit complète, tu dois imprimer le formulaire complémentaire (formulaire), le remplir à la main et l'envoyer, ainsi qu'une lettre de motivation à l'adresse suivante"
        if($inscription['public_type'] == 'couple' || $inscription['public_type'] == 'famille' || $inscription['public_type'] == 'fiances')
            $messageClient.= $trad["ccn_mail_6_vous"]
                . "<a href='http://" . $_SERVER['HTTP_HOST'] . $inscription['formulaire_pdf']['url'] ."'>" . $inscription['formulaire_pdf']['title'] ."</a>"
                . $trad["ccn_mail_7_1_couple"] . " :<br/>" ;
        else $messageClient.= $trad["ccn_mail_6_".$tuOuVous]
                    . "<a href='http://" . $_SERVER['HTTP_HOST'] . $inscription['formulaire_pdf']['url'] ."'>" . $inscription['formulaire_pdf']['title'] ."</a>"
                    . $trad["ccn_mail_7_1_".$tuOuVous] . " :<br/>" ;
    }
    if($inscription['motivation'] || $inscription['formulaire_pdf']) {
        /*adresse du contact*/
        $messageClient.= $inscription['contact']['prenom'] . " " . $inscription['contact']['nom'] . "<br/>";
        $messageClient.= $inscription['contact']['position']['address'] . "<br/><br/>";
    }
    if($inscription['entretien']) {
        /*Nous te rappelons que ton inscription sera confirmée suite à un entretien. Nous te contacterons bientôt pour fixer ensemble la date et le lieu de cet entretien.*/
        $messageClient.= $trad["ccn_mail_8_".$tuOuVous] . "<br/><br/>";
    }
    
    //RECAPITULATIF
    //Voici le récapitulatif de ton inscription
    $messageClient .= $trad["ccn_mail_8_".$tuOuVous] . "<br/><br/>";
    $messageClient .= "<table width=100% style='border: 1px solid #000000' frame='box' rules='all'>";
    if($nbInscrits ==1)
        $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_personne_inscrite"] . "</i></td><td width=67%>" .  $nomClient . "</td></tr>";
    else if($nbInscrits ==2)
        $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_personnes_inscrites"] . "</i></td><td width=67%>" .  $nomClient . "</td></tr>";
    if($inscription['enfants_org']){
        $nomsEnfants = "";
        foreach ($inscription['enfants_org'] as $index => $enfant){
            if($index>0) $nomsEnfants .= ", ";
            $nomsEnfants .= $enfant['prenom'];
        }
        $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_enfants"] . "</i></td><td width=67%>" .  $nomsEnfants . "</td></tr>";
    }
    $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_proposition"] . "</i></td><td width=67%>" .  $inscription['propositionTitre'] . "</td></tr>";
    $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_date"] . "</i></td><td width=67%>" .  $inscription['propositionDate'] . "</td></tr>";
    $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_lieu"] . "</i></td><td width=67%>" .  $inscription['propositionLieu'] . "</td></tr>";
    $url="http://". $_SERVER['HTTP_HOST'] . $inscription['propositionUrl'];
    $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_page_web"] . "</i></td><td width=67%><a href='" . $url . "'>" . $url . "</a></td></tr>";
    $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_contact"] . "</i></td><td width=67%>" . $contactSecretariat  ."</td></tr>";

    $messageClient .= "</table>";

    //OPTIONS ET QUESTIONS DIVERSES
    $messageClient .= "<table width=100% style='border: 1px solid #000000' frame='box' rules='all'>";
    if($inscription['logement']) {
       $messageClient .= $this->questionToRecap($inscription['logement_org']);
    }
    if($inscription['transport']) {
       $messageClient .= $this->questionToRecap($inscription['transport_org']);
    }
    if($inscription['complementaire']) {
       $messageClient .= $this->questionToRecap($inscription['complementaire_org']);
    }        
    if($inscription['jai_connu']){
       $messageClient .= $this->questionToRecap($inscription['jai_connu_org']);
    }
    if($inscription['situation'] && !$inscription['autreSituation']) {
        $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_situation"] . "</i></td><td width=67%>" .  $inscription['situation'] . "</td></tr>";
    }
    if($inscription['autreSituation']){
       $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_situation"] . "</i></td><td width=67%>" .  $inscription['autreSituation'] . "</td></tr>";
    }
    if($inscription['remarques']) {
       $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_form_remarques"] . "</i></td><td width=67%>" .  $inscription['remarques'] . "</td></tr>";
        
    }
    
    $messageClient .= "</table><br/><br/>";
    /*Cordialement / à bientôt*/
    $messageClient .= $trad["ccn_mail_9_".$tuOuVous] . ",<br/><br/>";
    $messageClient .= $contactSecretariat;
    //ENVOI DE MAIL AU JEUNE
    $mailerService = Manager::getService('Mailer');
    $mailClient = $mailerService->getNewMessage();
    $mailClient->setTo('nicolas.rhone@gmail.com'); // à changer en $inscription['email']
    $mailClient->setFrom(array( $inscription['email'] => ($inscription['surname']." ".$inscription['name']))); // à changer en  $inscription['contact']['email'] => $inscription['contact']['text']
    $mailClient->setReplyTo(array($inscription['email'] => ($inscription['surname']." ".$inscription['name']))); // à changer en  $inscription['contact']['email'] => $inscription['contact']['text']
    $mailClient->setCharset('utf-8');
    $mailClient->setSubject($sujetClient);
    $mailClient->setBody($messageClient, 'text/html', 'utf-8');
    $errors = [];
    //$mailerService->sendMessage($mailClient, $errors);
    
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /**************SUJET SECRETARIAT*****************/
    if($inscription['serviteur']) $sujetSecretariat = $trad["ccn_inscription_serviteur"] . " - " . $inscription['text'] . " - " . $inscription['propositionTitre'];
   else $sujetSecretariat = $trad["ccn_inscription"] . " - " . $inscription['text'] . " - " . $inscription['propositionTitre'];
   

    /**************MESSAGE SECRETARIAT*****************/
    //STATUT DE L'INSCRIPTION
    $statut="";
    /*Si inscriptions ouvertes*/
    if($inscription['etat'] !='liste-attente' && $inscription['etat'] !='preinscrit') {
        if($inscription['accompte'] == 0) { //pas de frais d'inscription
            //Inscription ferme (pas de frais d'inscription)
            if($inscription['serviteur']) $statut = $trad["ccn_mail_sujet4_serviteur"];
            else $statut = $trad["ccn_mail_sujet4"];
        }
        else {
            //Inscription en attente de paiement des frais d'inscription (" accompte €)"
            if($inscription['serviteur']) $statut = $trad["ccn_mail_sujet5_serviteur"] . $inscription['accompteAvecMonnaie'] . ")";
            else $statut = $trad["ccn_mail_sujet5"] . $inscription['accompteAvecMonnaie'] . ")";            
        }
    }
    else if($inscription['etat'] =='liste-attente') {
        //Inscription en liste d'attente
        if($inscription['serviteur']) $statut = $trad["ccn_mail_sujet6_serviteur"];
        else $statut = $trad["ccn_mail_sujet6"];
    }
    else if($inscription['etat'] =='preinscrit') {
        //Preinscription
        if($inscription['serviteur']) $statut = $trad["ccn_mail_sujet8_serviteur"];
        else $statut = $trad["ccn_mail_sujet8"];
    }
    $dateInscription = date("d/m/Y");
    $messageSecretariat .="<h3>" .  $trad["ccn_inscription"] . " " . $inscription['text'] . " - " . $dateInscription . "</h3>";
    $messageSecretariat .="<h4>" . $inscription['propositionTitre'] . "</h4>";
    $messageSecretariat .="<h4>" . $trad["ccn_label_statut"] . " : " . $statut . "</h4>";
    
    $messageSecretariat .= "<table width=100% style='border: 1px solid #000000' frame='box' rules='all'>";
    if($nbInscrits == 1){
        $messageSecretariat .= $this->addLine($trad["ccn_label_nom"], $inscription['name'] );
        $messageSecretariat .= $this->addLine($trad["ccn_label_prenom"], $inscription['surname'] );
        $messageSecretariat .= $this->addLine($trad["ccn_label_dateNaiss"], date("d/m/Y",$inscription['birthdate']) );
        if($inscription['birthdate']) {
            $messageSecretariat .= $this->addLine($trad["ccn_label_age_debut_proposition"], $this->getAge($inscription['birthdate'], $inscription['dateDebut'])." ". $trad["ccn_ans"]);
        }
        if($inscription['sexe']) {
            $sexe = ($inscription['sexe']['sexe'] =='H') ? $trad["ccn_form_homme"] : $trad["ccn_form_femme"];
            $messageSecretariat .= $this->addLine($trad["ccn_label_sexe"], $sexe );
        }
    }

    /*
            if (sexe) :
                if sexe == 'H' :
                    texteSexe = self.tr("ccn_form_homme")
                else :
                    if sexe == 'F' :
                        texteSexe = self.tr("ccn_form_femme")
                    else :
                        texteSexe = ''
                messageAdmin += "<tr><td bgcolor='#8CACBB' width=33%><i>" + self.tr("ccn_label_sexe") + "</i></td><td width=67%><font size='3'>" +  texteSexe + "</font></td></tr>"
            messageAdmin += "<tr><td bgcolor='#8CACBB' width=33%><i>" + self.tr("ccn_form_nationalite") + "</i></td><td width=67%><font size='3'>" +  nationalite + "</font></td></tr>"
            messageAdmin += "<tr><td bgcolor='#8CACBB' width=33%><i>" + self.tr("ccn_form_profession") + "</i></td><td width=67%><font size='3'>" +  profession + "</font></td></tr>"
            
            messageAdmin += "<tr><td bgcolor='#8CACBB' width=33%><i>" + self.tr("ccn_label_adresse") + "</i></td><td width=67%><font size='3'>"  + adresse + "</font></td></tr>"
            messageAdmin += "<tr><td bgcolor='#8CACBB' width=33%><i>" + self.tr("ccn_label_codepostal") + " - " + self.tr("ccn_label_ville") + "</i></td><td width=67%><font size='3'>"  + codepostal + " " + ville + "</font></td></tr>"
            messageAdmin += "<tr><td bgcolor='#8CACBB' width=33%><i>" + self.tr("ccn_label_pays") + "</i></td><td width=67%><font size='3'>"  + pays + "&nbsp;</font></td></tr>"
            
            messageAdmin += "<tr><td bgcolor='#8CACBB' width=33%><i>" + self.tr("ccn_label_email") + "</i></td><td width=67%><font size='3'>"  + email + "</font></td></tr>"

            messageAdmin += "<tr><td bgcolor='#8CACBB' width=33%><i>" + self.tr("ccn_form_telephone_fixe") + "</i></font></td><td width=67%><font size='3'>"  + self.getTelephoneFormate(tel1) + "&nbsp;</font></td></tr>"
            messageAdmin += "<tr><td bgcolor='#8CACBB' width=33%><i>" + self.tr("ccn_form_telephone_portable") + "</i></font></td><td width=67%><font size='3'>"  + self.getTelephoneFormate(tel2) + "&nbsp;</font></td></tr>"

            if typePublicChoisi == "adolescent":
                if tel2Pers2 :
                    messageAdmin += "<tr><td bgcolor='#8CACBB' width=33%><i>" + self.tr("ccn_form_telephone_portable_parent") + "</i></font></td><td width=67%><font size='3'>"  + self.getTelephoneFormate(tel2Pers2) + "&nbsp;</font></td></tr>"
                if emailPers2 :
                    messageAdmin += "<tr><td bgcolor='#8CACBB' width=33%><i>" + self.tr("ccn_form_mail_parent") + "</i></font></td><td width=67%><font size='3'>"  + emailPers2 + "&nbsp;</font></td></tr>"
                       
   */
    
    
    $mailSecretariat = $mailerService->getNewMessage();
    $mailSecretariat->setTo('nicolas.rhone@gmail.com'); // à changer en $inscription['contact']['email']
    $mailSecretariat->setFrom(array( $inscription['email'] => ($inscription['surname']." ".$inscription['name']))); 
    $mailSecretariat->setReplyTo(array($inscription['email'] => ($inscription['surname']." ".$inscription['name']))); 
    $mailSecretariat->setCharset('utf-8');
    $mailSecretariat->setSubject($sujetSecretariat);
    $mailSecretariat->setBody($messageSecretariat, 'text/html', 'utf-8');
    $errors = [];
    $mailerService->sendMessage($mailSecretariat, $errors);    
    
}















   

    
    protected function subTokenFilter(&$token)
    {
        return array_intersect_key($token, array_flip(array('access_token', 'refresh_token', 'lifetime', 'createTime')));
    }
    
    protected function processInscription($inscription) {
        //dates
        $inscription['birthdate'] = strtotime($inscription['birthdate']);
        if($inscription['dateNaissPers2']) $inscription['dateNaissPers2'] = strtotime($inscription['dateNaissPers2']);
        //telephones formatés pour la France
        if($this->getPays() == "FR"){
            if($inscription['tel1']) $inscription['tel1'] = $this->formatTelephone($inscription['tel1']);
            if($inscription['tel2']) $inscription['tel2'] = $this->formatTelephone($inscription['tel2']);
            if($inscription['tel1Pers2']) $inscription['tel1Pers2'] = $this->formatTelephone($inscription['tel1Pers2']);
            if($inscription['tel2Pers2']) $inscription['tel2Pers2'] = $this->formatTelephone($inscription['tel2Pers2']);
        }
        if($inscription['logement']) {
             $inscription['logement_org'] = $inscription['logement'];           
            $inscription['logement'] = $this->questionToAnswer($inscription['logement']);
        }
        if($inscription['transport']) {
             $inscription['transport_org'] = $inscription['transport'];           
            $inscription['transport'] = $this->questionToAnswer($inscription['transport']);
        }
        if($inscription['complementaire']) {
            $inscription['complementaire_org'] = $inscription['complementaire'];
            $inscription['complementaire'] = $this->questionToAnswer($inscription['complementaire']);
        }        
        if($inscription['jai_connu']){
            $inscription['jai_connu_org'] = $inscription['jai_connu'];
            $inscription['jai_connu'] = $this->questionToAnswer($inscription['jai_connu'], false);
        }
        if($inscription['autreSituation']){
            $inscription['situation'] .= " : ".$inscription['autreSituation'];
        }
        if($inscription['enfants']){
            $inscription['enfants_org'] = $inscription['enfants'];
            foreach ($inscription['enfants'] as $index => $enfant){
                $inscription['enfants'][$index] = $enfant['prenom']. " ".strtoupper($enfant['nom'])." ; ".$enfant['birthdateF']." ; ".$enfant['sexe'];
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
    protected function questionToRecap($question){
            foreach ($question as $titre => $reponse){
                $answer = "";
                if(is_string($reponse)) $answer= $reponse; // pour texte ou radio
                else {
                    foreach($reponse as $value) $answer .= $value.", ";//pour checkbox
                }
                return "<tr><td bgcolor='#8CACBB' width=33%><i>" .$titre . "</i></td><td width=67%>" . $answer . "</td></tr>";
            }
        
    }
    protected function addLine($titre, $reponse, $colNb){
        return "<tr><td bgcolor='#8CACBB' width=33%><i>" .$titre . "</i></td><td width=67%>" . $reponse . "</td></tr>";
    }
    protected function getAge($dateDebut, $dateFin){ // avec dates passées par strtotime (ie timestamp)
        return floor(($dateFin-$dateDebut) / (365*60*60*24));
    }
    protected function formatTelephone($number){
        $toReplace = array(" ", "/", "+");
        $telephoneFormat = str_replace($toReplace,"",$number); //supprimer espace, + et /
        //336xxxxxxxx
        if(strlen($telephoneFormat) == 11) {
            $telephoneFormat = "+".substr($telephoneFormat, 0,2)."/".substr($telephoneFormat, 2,9);
        }
        //00336xxxxxxxx
        else if(strlen($telephoneFormat) == 13 && substr($telephoneFormat, 0,2) == "00") {
            $telephoneFormat = "+".substr($telephoneFormat, 2,2)."/".substr($telephoneFormat, 4,9);
        }
        else if(strlen($telephoneFormat) == 10 && substr($telephoneFormat, 0,1) == "0") {
            $telephoneFormat = "+33/".substr($telephoneFormat, 1,9);
        }
        return $telephoneFormat;
    }
    
    protected function getPays(){
        switch($_SERVER['HTTP_HOST']) {
            case "ccn.chemin-neuf.fr" : 
                return "FR"; break;
        }
     }
    protected function getAccountId(){
        switch($_SERVER['HTTP_HOST']) {
            case "ccn.chemin-neuf.fr" : 
                return "55473e9745205e1d3ef1864d"; break;
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


