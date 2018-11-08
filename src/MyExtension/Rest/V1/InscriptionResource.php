<?php
namespace RubedoAPI\Rest\V1;
use Zend\Mvc\Controller\AbstractActionController;
use Rubedo\Collection\AbstractCollection;
use Rubedo\Services\Manager;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use WebTales\MongoFilters\Filter;
use Zend\Json\Json;
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
        $this->define();
    }
				
    public function getAction($params) {
        $typeId = "561627c945205e41208b4581";
        //$params = $this->params()->fromQuery();
        $filters = Filter::factory();
        if (!empty($params['startDate'])) {
            $filters->addFilter(
                Filter::factory('OperatorTovalue')->setName('createTime')
                    ->setOperator('$gte')
                    ->setValue((int)$params['startDate'])
            );
        }
        if (!empty($params['endDate'])) {
            $filters->addFilter(
                Filter::factory('OperatorTovalue')->setName('createTime')
                    ->setOperator('$lte')
                    ->setValue((int)$params['endDate'])
            );
        }
								/*Filter by propositionId*/
								if (!empty($params['propositionId'])) {
            $filters->addFilter(
                Filter::factory('In')->setName('fields.proposition')
																				->setValue([(string)$params['propositionId'], '*'])
            );
        }
								/*only get registrations in the default workspace of the user for security*/
								$writeWorkspaces = Manager::getService('CurrentUser')->getWriteWorkspaces();
								/*$filters->addFilter(
                Filter::factory('Value')->setName('writeWorkspace')
																				->setValue((string)$mainWorkspace['id'])
        );*/
								$filters->addFilter(
												Filter::factory('In')->setName('writeWorkspace')
																->setValue($writeWorkspaces)
								);
        $contentType = Manager::getService("ContentTypes")->findById($typeId);
        $filters->addFilter(
            Filter::factory('Value')->setName('typeId')
                ->setValue($typeId)
        );
        $contents = Manager::getService('Contents')->getOnlineList($filters);
								//var_dump($contents);
        $fileName = 'export_rubedo_contents_' . $contentType['type'] . '_' . time() . '.csv';
        $filePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $fileName;
        $csvResource = fopen($filePath, 'w+');
        $fieldsArray = array(
            "text" => null,
            "summary" => null
        );
        $headerArray = array(
            "text" => "Title",
            "summary" => "Summary"
        );
        $fieldsArray["createTime"] = null;
        $fieldsArray["createUser"] = null;
        $multivaluedFieldsArray = array();
        $headerArray["createTime"] = "Creation";
        $headerArray["createUser"] = "Nom du créateur";
        $exportableFieldTypes = [
            "Ext.form.field.Text",
            "textfield",
            "Ext.form.field.TextArea",
            "textarea",
            "textareafield",
            "Ext.form.field.Number",
            "numberfield",
            "Ext.form.field.ComboBox",
            "combobox",
            "Ext.form.field.Checkbox",
            "checkboxfield",
            "Ext.form.RadioGroup",
            "radiogroup",
            "Ext.form.field.Date",
            "datefield",
            "Ext.form.field.Time",
            "timefield",
            "Ext.slider.Single",
            "slider",
            "Rubedo.view.CKEField",
            "CKEField",
            "Rubedo.view.localiserField",
            "localiserField",
        ];
        foreach ($contentType['fields'] as $typeField) {
            if (in_array($typeField['cType'], $exportableFieldTypes)) {
                $fieldsArray[$typeField['config']['name']] = $typeField['cType'];
                $headerArray[$typeField['config']['name']] = $typeField['config']['fieldLabel'];
                if (isset($typeField['config']['multivalued']) && $typeField['config']['multivalued']) {
                    $multivaluedFieldsArray[] = $typeField['config']['name'];
                }
            }
        }
        $taxoService = Manager::getService("Taxonomy");
        $taxoTermsService = Manager::getService("TaxonomyTerms");
        $taxoHeaderArray = array();
        $taxoFieldsArray = array();
        foreach ($contentType['vocabularies'] as $vocabId) {
            if (!empty($vocabId) && $vocabId != "navigation") {
                $vocabulary = $taxoService->findById($vocabId);
                if ($vocabulary) {
                    $taxoHeaderArray[$vocabId] = $vocabulary['name'];
                    $taxoFieldsArray[] = $vocabId;
                }
            }
        }
        $csvLine = array();
        foreach ($fieldsArray as $field => $fieldType) {
            $csvLine[] = $headerArray[$field];
        }
        foreach ($taxoFieldsArray as $field) {
            $csvLine[] = $taxoHeaderArray[$field];
        }
        fputcsv($csvResource, $csvLine, ';');
        $usersService=Manager::getService("Users");
        foreach ($contents['data'] as $content) {
            $csvLine = array();
            foreach ($fieldsArray as $field => $fieldType) {
                switch ($field) {
                    case 'createTime':
                        $csvLine[] = date('d-m-Y H:i:s', $content["createTime"]);
                        break;
                    case 'createUser':
                        $foundUser=$usersService->findByid($content["createUser"]["id"]);
                        if ($foundUser){
                            $csvLine[] = $foundUser["name"];
                        } else {
                            $csvLine[] = "";
                        }
                        break;
                    case 'text':
                        $csvLine[] = isset($content[$field]) ? $content[$field] : '';
                        break;
                    default:
                        if (!isset($content['fields'][$field])) {
                            $csvLine[] = '';
                        } elseif (in_array($field, $multivaluedFieldsArray) && is_array($content['fields'][$field])) {
                            $formatedValuesArray = array();
                            foreach ($content['fields'][$field] as $unformatedValue) {
                                $formatedValuesArray[] = $this->formatFieldData($unformatedValue, $fieldType);
                            }
                            $csvLine[] = implode(", ", $formatedValuesArray);
                        } else {
                            $csvLine[] = $this->formatFieldData($content['fields'][$field], $fieldType);
                        }
                        break;
                }
            }
            foreach ($taxoFieldsArray as $taxoField) {
                if (!isset($content['taxonomy'][$taxoField])) {
                    $csvLine[] = '';
                } elseif (is_array($content['taxonomy'][$taxoField])) {
                    $termLabelsArray = array();
                    foreach ($content['taxonomy'][$taxoField] as $taxoTermId) {
                        if (!empty($taxoTermId)) {
                            $foundTerm = $taxoTermsService->findById($taxoTermId);
                            if ($foundTerm) {
                                $termLabelsArray[] = $foundTerm['text'];
                            }
                        }
                    }
                    $csvLine[] = implode(", ", $termLabelsArray);
                } else {
                    if (!empty($content['taxonomy'][$taxoField])) {
                        $foundTerm = $taxoTermsService->findById($content['taxonomy'][$taxoField]);
                        if ($foundTerm) {
                            $csvLine[] = $foundTerm['text'];
                        } else {
                            $csvLine[] = '';
                        }
                    } else {
                        $csvLine[] = '';
                    }
                }
            }
            fputcsv($csvResource, $csvLine, ';');
        }
        $content = file_get_contents($filePath);
        //header("Content-type: text/x-csv");
        //header("Content-Disposition: attachment; filename=".$fileName."");
        //echo($content);
        return [
            'success' => true,
            'path' => $content
        ];
    }

				
				
    public function postAction($params)
    {
        
        //GET NUMERO D'INSCRIPTION ACTUEL
        $id = "57e1a814245640fc008ba8a8"; // id du contenu "Numéro d'inscription CCN" c'est ici qu'on note le dernier numéro d'inscription, qu'on incrémente de 1 à chaque inscription

        $wasFiltered = AbstractCollection::disableUserFilter(true);
        $contentsService = Manager::getService("ContentsCcn");
        $content = $contentsService->findById($id,false,false);
        $content["fields"]["value"] +=1;
        $content['i18n'] =  array(
            "fr" =>array("fields" => array("text"=>$content["fields"]["text"])),
            "en" =>array("fields" => array("text"=>$content["fields"]["text"])),
            "de" =>array("fields" => array("text"=>$content["fields"]["text"])),
            "pl" =>array("fields" => array("text"=>$content["fields"]["text"])),
            "es" =>array("fields" => array("text"=>$content["fields"]["text"])),
            "hu" =>array("fields" => array("text"=>$content["fields"]["text"])),
            "it" =>array("fields" => array("text"=>$content["fields"]["text"]) ),
            "pt" =>array("fields" => array("text"=>$content["fields"]["text"])),
            "pt-BR" =>array("fields" => array("text"=>$content["fields"]["text"])),
            "ar" =>array("fields" => array("text"=>$content["fields"]["text"])),
            "nl" =>array("fields" => array("text"=>$content["fields"]["text"])),
            "cs" =>array("fields" => array("text"=>$content["fields"]["text"]))
		);
	    $content['i18n'][$params['lang']->getLocale()]['fields']['text'] = $content["fields"]["text"];
        $result = $contentsService->update($content, array(),false);
        $inscriptionNumber = $content["fields"]["value"];
        //GET SITE CONFIG
        $siteConfig = Manager::getService("SitesConfigCcn")->getConfig()['paymentConfig']['nativePMConfig'];
        //PREPARE INSCRIPTION
        $inscriptionForm=[];
        $inscriptionForm['fields'] =  $params['inscription'];
        $codePays = $siteConfig['codePays'];
								$inscriptionForm['fields']['text'] = "". $codePays . str_pad($inscriptionNumber, 6, '0', STR_PAD_LEFT);
        $inscriptionForm['text'] = $inscriptionForm['fields']['text'];
        $inscriptionForm['target'] = $params['workspace'];
        $inscriptionForm['writeWorkspace'] = $params['workspace'];
        $inscriptionForm['typeId'] = "561627c945205e41208b4581";
        $inscriptionForm['fields'] = $this->processInscription($inscriptionForm['fields']);
        
        //GET SECRETARIAT
        if($inscriptionForm['fields']['contact']) {
            $mailSecretariat = $contentsService->findById($inscriptionForm['fields']['contact'],false,false);
            $inscriptionForm['fields']['mailSecretariat'] = $mailSecretariat['fields']['email'];
            $inscriptionForm['fields']['contact'] = $mailSecretariat['fields'];

        }
        $inscriptionForm['i18n'] = array(
            $params['lang']->getLocale() => array(
                "fields" => array(
                    "text"=>$inscriptionForm['fields']['text'] 
                )
            )
        );
        $inscriptionForm['status'] = 'published';
        $inscriptionForm['online'] = true;
        $inscriptionForm['startPublicationDate'] = ""; $inscriptionForm['endPublicationDate'] = "";
        $inscriptionForm['nativeLanguage'] = $params['lang']->getLocale();
        $resultInscription = $contentsService->create($inscriptionForm, array(),false,false);

        //GET PAYEMENT INFOS
        if($inscriptionForm['fields']['montantAPayerMaintenant']>0) {
            $paymentMeansId = $siteConfig['conf_paf'];
            $paymentMeans = $contentsService->findById($paymentMeansId,false,false);
            $inscriptionForm['fields']['paymentInfos'] =$paymentMeans['fields'];
            //return payement conf id in response
            $resultInscription['paymentConfID'] = $paymentMeansId;
        }
        
        
       if($resultInscription['success']) {
            $this->sendInscriptionMail($inscriptionForm['fields'], $params['lang']->getLocale());
        }
       if($resultInscription['success']) {
            //usleep(500000);
            $content = $contentsService->findById($resultInscription['data']['id'], false, false);
            $content['fields']['statut'] = $content['fields']['statut'] . " ";
            $content['i18n'] = array(
                    $content['locale'] =>array(
                        "fields" => array("text"=>$content["text"])
                    )
                );
            $result = $contentsService->update($content, array(),false);
            Manager::getService('ElasticContents')->index($content);
        }
        AbstractCollection::disableUserFilter(false);

        return array('success' => $result['success'], 'id' =>$inscriptionForm['fields']['text'],'result'=>$resultInscription);
        
   }
   
   
protected function sendInscriptionMail($inscription,$lang){
   $trad = json_decode(file_get_contents('http://' . $_SERVER['HTTP_HOST'] .'/theme/cte/elements/'.$lang.'.json'),true);
    //tutoyement pour ados ou jeunes ou personnes connues
    $tutoyer = 0;
    $tuOuVous="vous";
    if($inscription['public_type'] == 'adolescent' || $inscription['public_type'] == 'jeune-adulte' ) {
        $tutoyer = 1;
        $tuOuVous="tu";
    }/*
    if($inscription['personneConnue'] && !($inscription['public_type'] == 'couple' || $inscription['public_type'] == 'famille'|| $inscription['public_type'] == 'fiances') ) {
        $tutoyer = 1;
        $tuOuVous="tu";
    }*/
    //nombre de personnes inscrites
    $nbInscrits = 1;
    //nom pour le mail aux inscrits
    if(isset($inscription['prenomPers2']) && $inscription['prenomPers2']!="" )  {
        $nbInscrits = 2;
        if(!$inscription['nomPers2'] || $inscription['nomPers2']=="" || $inscription['nomPers2'] == $inscription['nom'])
            $nomClient = $inscription['surname'] . " " . $trad["et"] . " " . $inscription['prenomPers2'] . " " . $inscription['nom'];
        else
            $nomClient = $inscription['surname'] . " " . $inscription['nom'] . " " . $trad["et"] . " " . $inscription['prenomPers2'] . " " . $inscription['nomPers2'];    
    }
    else {
        $nomClient = $inscription['surname'] . " ".  $inscription['nom'];
    }
    //CONTACT SECRETARIAT
    $contactSecretariat =  $inscription['contact']['text'] ;
    if(isset($inscription['contact']['prenom']) || isset($inscription['contact']['nom'])) $contactSecretariat .=  " - ". $inscription['contact']['prenom']." ".$inscription['contact']['nom'];
    if(isset($inscription['contact']['position'])) $contactSecretariat .=  " - ". $inscription['contact']['position']['address'];
    if(isset($inscription['contact']['telephone'])) $contactSecretariat .=  " - ". $inscription['contact']['telephone'];
    $contactSecretariat .= " - <a href='mailto:" . $inscription['contact']['email'] . "'>" . $inscription['contact']['email'] . "</a>" ;
    $messageClient="";
    $messageSecretariat="";
        /**************SUJET CLIENT*****************/
    $sujetClient = "";
    /*Si inscriptions ouvertes*/
    if($inscription['statut'] !='liste_attente' && $inscription['statut'] !='preinscrit') {
        if($inscription['serviteur']) $sujetClient.= $trad["ccn_mail_sujet2b_serviteur"] . " - " . $inscription['propositionTitre'] ;
        else $sujetClient.= $trad["ccn_mail_sujet2b"] . " - " . $inscription['propositionTitre'];
    }
    else if($inscription['statut'] =='liste_attente') {
        if($inscription['serviteur']) $sujetClient.= $trad["ccn_mail_sujet3_serviteur"] . " - " . $inscription['propositionTitre'] ;
        else $sujetClient.= $trad["ccn_mail_sujet3"] . " - " . $inscription['propositionTitre'];        
    }
    else if($inscription['statut'] =='preinscrit') {
        if($inscription['serviteur']) $sujetClient.= $trad["ccn_mail_sujet9_serviteur"] . " - " . $inscription['propositionTitre'] ;
        else $sujetClient.= $trad["ccn_mail_sujet9"] . " - " . $inscription['propositionTitre'];        
    }
    /**************MESSAGE CLIENT*****************/
    //SALUTATION
    if($tutoyer || $inscription['personneConnue'] || $lang =='hu') {
        $messageClient .="<p>".$trad["ccn_mail_1_tu"]." ".$inscription['surname'] ;// Bonjour Anne 
        if($nbInscrits==2) $messageClient.= " " . $trad["et"] . " " . $inscription['prenomPers2']; //et Patrick
    }
    else $messageClient .= "<p>".$trad["ccn_mail_1_vous"];//Madame, monsieur pour vouvoyement
    $messageClient.= ",<br/><br/>";
    
    //RECEPTION INSCRIPTION
    //Nous avons bien reçu ton inscription
    if($inscription['serviteur']) {
        if($inscription['statut'] =='liste_attente') {
            $messageClient .= ($inscription['mailInscriptionService']) ? $inscription['mailInscriptionService'] : $trad["ccn_mail_14_".$tuOuVous];
            //Nous te contacterons si des places se libèrent.
            $messageClient .= " " . $trad["ccn_mail_15_".$tuOuVous];
        }
        if($inscription['statut'] =='preinscrit') {
            $messageClient .= ($inscription['mailInscriptionService']) ? $inscription['mailInscriptionService'] : $trad["ccn_mail_22_".$tuOuVous];
            //Nous te contacterons pour te confirmer ton inscription.
            $messageClient .= " " .  $trad["ccn_mail_21_".$tuOuVous];
        }
        else $messageClient .= ($inscription['mailInscriptionService']) ? $inscription['mailInscriptionService'] : $trad["ccn_mail_20_".$tuOuVous];
    }
    else {
        if($inscription['statut'] =='liste_attente') {
            $messageClient .= ($inscription['mailInscription']) ? $inscription['mailInscription'] : $trad["ccn_mail_14_".$tuOuVous];
            //Nous te contacterons si des places se libèrent.
            $messageClient .= " " . $trad["ccn_mail_15_".$tuOuVous];
        }
        if($inscription['statut'] =='preinscrit') {
            $messageClient .= ($inscription['mailInscription']) ? $inscription['mailInscription'] : $trad["ccn_mail_22_".$tuOuVous];
            //Nous te contacterons pour te confirmer ton inscription.
            $messageClient .= " " . $trad["ccn_mail_21_".$tuOuVous];
        }
        else $messageClient .= ($inscription['mailInscription']) ? $inscription['mailInscription'] : $trad["ccn_mail_10_".$tuOuVous];
    }
    $messageClient.="<br/><br/>";
    //INFOS POUR LE PAIEMENT SI PAIEMENT PROPOSE
    if($inscription['isPayment'] && $inscription['montantAPayerMaintenant'] > 0) {
        if($inscription['modePaiement'] == 'cheque') {
            //Comme convenu, nous attendons ton cheque de 60€
            $messageClient .= $trad["ccn_mail_23_".$tuOuVous] . $inscription['montantAPayerMaintenantAvecMonnaie'] ;
            //qui permettra de valider votre inscription (si accompte)
            if($inscription["accompte"] && $inscription["accompte"]>0) {
                $messageClient .=  " " .$trad["ccn_mail_23_1_".$tuOuVous]  ;
            }
            $messageClient .=". ";
            //Ce chèque doit être à l'ordre de ${ordre_cheque} et envoyé à l'adresse suivante
            $messageClient .= $trad["ccn_mail_24"] . "<i>" . $inscription['paymentInfos']['libelleCheque'] . "</i>" . $trad["ccn_mail_24_1"] ."<br/>";
            $messageClient .= $inscription['contact']['text'] . "<br/>" . $inscription['contact']['position']['address'] . "<br/><br/>";
            if($inscription['paiement_maintenant'] == 'accompte') {
                //Attention, ton inscription ne sera complète que quand nous aurons reçu ton chèque.
                $messageClient .= $trad["ccn_mail_30_".$tuOuVous] . "<br/><br/>";
            }
            
        }
        
        else if($inscription['modePaiement'] == 'virement') {
            //Comme convenu, nous attendons ton virement de 60€
            $messageClient .= $trad["ccn_mail_25_".$tuOuVous] . $inscription['montantAPayerMaintenantAvecMonnaie'] . ". ";
            //Tu dois te connecter à ton service bancaire en ligne ou te rendre à ta banque et effectuer un virement sur notre compte '${intitule}' dont les références sont '${compte}'.
            $messageClient .= $trad["ccn_mail_26_".$tuOuVous] . "<i>" . $inscription['paymentInfos']['titreCompteVir'] . "</i><br/>" . $trad["ccn_mail_26_1"] ." : ". $inscription['paymentInfos']['ribTexte'] . "<br/>";
            /*Ajouter image RIB*/
            //$messageClient .= "<center><img src='http://" . $_SERVER['HTTP_HOST']  . "/dam?media-id=" . $inscription['paymentInfos']['rib'] . "&width=300px'></center><br/>" ;
            if($inscription['paiement_maintenant'] == 'accompte') {
                //Attention, ton inscription ne sera complète que quand nous aurons reçu ton virement.
                $messageClient .= $trad["ccn_mail_31_".$tuOuVous] . "<br/><br/>";
            }            
        }
        
        else if($inscription['modePaiement'] == 'carte') {
            //Nous allons vérifier le succès de ton paiement en ligne de 60€ et tu recevras un mail de confirmation de ton paiement.
            $messageClient .= $trad["ccn_mail_27_".$tuOuVous] . $inscription['montantAPayerMaintenantAvecMonnaie'] . $trad["ccn_mail_27_1_".$tuOuVous] ."<br/><br/>";
            if($inscription['paiement_maintenant'] != 'accompte') {
                //Attention, ton inscription ne sera complète que quand ton paiement en ligne aura été confirmé.
                $messageClient .= $trad["ccn_mail_32_".$tuOuVous] . "<br/><br/>";
            }            
        }
        # si le montant total à payer n'a pas été défini, il a été mis à 0 et alors, on n'affiche pas la ligne suivante
        if (isset($inscription['montantTotalAPayer']) && ($inscription['montantTotalAPayer'] >0) ) {
            //Nous te rappelons que d'après le choix que tu as fais, ta participation totale est de 120€. 
            $messageClient .= $this->translate($trad["ccn_mail_28_".$tuOuVous],'%montantAvecMonnaie%',$inscription['montantTotalAPayerAvecMonnaie']) . ".<br/><br/>";
        }
            
    }
    
    
    
    // NOTES SUPPLEMENTAIRES (ENTRETIEN / LETTRES / PDF A REMPLIR)
    if(isset($inscription['motivation']) && !$inscription['formulaire_pdf']) {
        //Nous te rappelons que pour que ton inscription soit complète, tu dois envoyer une lettre de motivation à l'adresse suivante
        if($inscription['public_type'] == 'couple' || $inscription['public_type'] == 'famille' || $inscription['public_type'] == 'fiances')
            $messageClient .= $trad["ccn_mail_5_couple"] . " :<br/>";
        else $messageClient .= $trad["ccn_mail_5_".$tuOuVous] . " :<br/>";
    }
    
    if(!isset($inscription['motivation']) && isset($inscription['formulaire_pdf'])) {
        //Nous te rappelons que pour que ton inscription soit complète, tu dois imprimer le formulaire complémentaire ( formulaire ), le remplir à la main et l'envoyer à l'adresse suivante" 
        $messageClient.= $trad["ccn_mail_6_".$tuOuVous]
                . "<a href='http://" . $_SERVER['HTTP_HOST'] . $inscription['formulaire_pdf']['url'] ."'>" . $inscription['formulaire_pdf']['title'] ."</a>"
                . $trad["ccn_mail_6_1"] . " :<br/>" ;
    }
    if(isset($inscription['motivation']) && isset($inscription['formulaire_pdf'])) {
        //Nous te rappelons que pour que ton inscription soit complète, tu dois imprimer le formulaire complémentaire (formulaire), le remplir à la main et l'envoyer, ainsi qu'une lettre de motivation à l'adresse suivante"
        if($inscription['public_type'] == 'couple' || $inscription['public_type'] == 'famille' || $inscription['public_type'] == 'fiances')
            $messageClient.= $trad["ccn_mail_6_vous"]
                . "<a href='http://" . $_SERVER['HTTP_HOST'] . $inscription['formulaire_pdf']['url'] ."'>" . $inscription['formulaire_pdf']['title'] ."</a>"
                . $trad["ccn_mail_7_1"] . " :<br/>" ;
        else $messageClient.= $trad["ccn_mail_6_".$tuOuVous]
                    . "<a href='http://" . $_SERVER['HTTP_HOST'] . $inscription['formulaire_pdf']['url'] ."'>" . $inscription['formulaire_pdf']['title'] ."</a>"
                    . $trad["ccn_mail_7_1"] . " :<br/>" ;
    }
    if(isset($inscription['motivation']) || isset($inscription['formulaire_pdf'])) {
        /*adresse du contact*/
        $messageClient.= $inscription['contact']['prenom'] . " " . $inscription['contact']['nom'] . "<br/>";
        $messageClient.= $inscription['contact']['position']['address'] . "<br/><br/>";
    }
    if(isset($inscription['entretien'])) {
        /*Nous te rappelons que ton inscription sera confirmée suite à un entretien. Nous te contacterons bientôt pour fixer ensemble la date et le lieu de cet entretien.*/
        $messageClient.= $trad["ccn_mail_8_".$tuOuVous] . "<br/><br/>";
    }
    // NUMERO D'INSCRIPTION POUR SUIVI
     //"Ton numéro d'inscription est " + idInscription + "<br><br>"
    $messageClient .= $trad["ccn_mail_3_".$tuOuVous] . " ". $inscription['text'] . ".<br/><br/>";
    
    //RECAPITULATIF
    //Voici le récapitulatif de ton inscription
    $messageClient .= $trad["ccn_mail_29_".$tuOuVous] . "<br/><br/>";
    $messageClient .= "<table width=100% style='border: 1px solid #000000' frame='box' rules='all'>";
    if($nbInscrits ==1)
        $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_personne_inscrite"] . "</i></td><td width=67%>" .  $nomClient . "</td></tr>";
    else if($nbInscrits ==2)
        $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_personnes_inscrites"] . "</i></td><td width=67%>" .  $nomClient . "</td></tr>";
    if(isset($inscription['enfants_org'])){
        $nomsEnfants = "";
        foreach ($inscription['enfants_org'] as $index => $enfant){
            if($index>0) $nomsEnfants .= ", ";
            $nomsEnfants .= $enfant['prenom'];
        }
        $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_enfants"] . "</i></td><td width=67%>" .  $nomsEnfants . "</td></tr>";
    }
    $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_proposition"] . "</i></td><td width=67%>" .  $inscription['propositionTitre'] . "</td></tr>";
    if(isset($inscription['propositionDate']) && $inscription['propositionDate'] != "") $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_date"] . "</i></td><td width=67%>" .  $inscription['propositionDate'] . "</td></tr>";
    $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_lieu"] . "</i></td><td width=67%>" .  $inscription['propositionLieu'] . "</td></tr>";
    $url="http://". $_SERVER['HTTP_HOST'] . $inscription['propositionUrl'];
    $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_page_web"] . "</i></td><td width=67%><a href='" . $url . "'>" . $inscription['propositionTitre'] . "</a></td></tr>";
    $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_contact"] . "</i></td><td width=67%>" . $contactSecretariat  ."</td></tr>";
    $messageClient .= "</table>";
    //OPTIONS ET QUESTIONS DIVERSES
    $messageClient .= "<table width=100% style='border: 1px solid #000000' frame='box' rules='all'>";
    if(isset($inscription['logement'])) {
       $messageClient .= $this->questionToRecap($inscription['logement_org']);
    }
    if(isset($inscription['transport'])) {
       $messageClient .= $this->questionToRecap($inscription['transport_org']);
    }
    if(isset($inscription['complementaire'])) {
       $messageClient .= $this->questionToRecap($inscription['complementaire_org']);
    }        
    if(isset($inscription['jai_connu'])){
       $messageClient .= $this->questionToRecap($inscription['jai_connu_org']);
    }
    if(isset($inscription['situation']) && !isset($inscription['autreSituation'])) {
        $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_situation"] . "</i></td><td width=67%>" .  $inscription['situation'] . "</td></tr>";
    }
    if(isset($inscription['autreSituation'])){
       $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_label_situation"] . "</i></td><td width=67%>" .  $inscription['autreSituation'] . "</td></tr>";
    }
    if(isset($inscription['remarques'])) {
       $messageClient .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_form_remarques"] . "</i></td><td width=67%>" .  $inscription['remarques'] . "</td></tr>";
        
    }
    
    $messageClient .= "</table><br/><br/>";
    /*Cordialement / à bientôt*/
    $messageClient .= $trad["ccn_mail_9_".$tuOuVous] . ",<br/><br/>";
    $messageClient .= $contactSecretariat;
    //ENVOI DE MAIL AUX INSCRITS
    $mailerService = Manager::getService('Mailer');
    $mailClient = $mailerService->getNewMessage();
    if($nbInscrits == 2 && $inscription['emailPers2'] && $inscription['emailPers2'] != "") {
        $mailClient->setTo(array($inscription['email'],$inscription['emailPers2']));
    }
    else  $mailClient->setTo($inscription['email']);
    
    // vérifier si le mail de secrétariat est en chemin-neuf.org ;  sinon envoyer depuis l'adresse web
    $senderMail = $inscription['contact']['email'];
    $senderDomain = explode("@", $inscription['contact']['email']);
    if($senderDomain[1] != "chemin-neuf.org"){
        $senderMail = "web@chemin-neuf.org";
    }
    $mailClient->setFrom(array( $senderMail => $inscription['contact']['text'])); 
    $mailClient->setReplyTo(array( $inscription['contact']['email'] => $inscription['contact']['text'])); 
    $mailClient->setCharset('utf-8');
    $mailClient->setSubject($sujetClient);
    $mailClient->setBody($messageClient, 'text/html', 'utf-8');
    $mailerService->sendMessage($mailClient, $errors);
    
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    
    /**************SUJET SECRETARIAT*****************/
    if($inscription['serviteur']) $sujetSecretariat = $trad["ccn_inscription_serviteur"] . " - " . $inscription['text'] . " - " . $inscription['nom'] . " - " . $inscription['propositionTitre'] . " - " . $inscription['propositionLieu'];
   else $sujetSecretariat = $trad["ccn_inscription"] . " - " . $inscription['text'] . " - " . $inscription['nom'] . " - " . $inscription['propositionTitre'] . " - " . $inscription['propositionLieu'];
   
    /**************MESSAGE SECRETARIAT*****************/
    //STATUT DE L'INSCRIPTION
    $statut="";
    /*Si inscriptions ouvertes*/
    if($inscription['statut'] !='liste_attente' && $inscription['statut'] !='preinscrit') {
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
    else if($inscription['statut'] =='liste_attente') {
        //Inscription en liste d'attente
        if($inscription['serviteur']) $statut = $trad["ccn_mail_sujet6_serviteur"];
        else $statut = $trad["ccn_mail_sujet6"];
    }
    else if($inscription['statut'] =='preinscrit') {
        //Preinscription
        if($inscription['serviteur']) $statut = $trad["ccn_mail_sujet8_serviteur"];
        else $statut = $trad["ccn_mail_sujet8"];
    }
    $dateInscription = date("d/m/Y");
    $messageSecretariat .="<h3>" .  $trad["ccn_inscription"] . " " . $inscription['text'] . " - " . $dateInscription . "</h3>";
    $messageSecretariat .="<h4>" . $inscription['propositionTitre'] . "</h4>";
    $messageSecretariat .="<h4>" . $trad["ccn_label_statut"] . " : " . $statut . "</h4>";
    
    $messageSecretariat .= "<table width=100% style='border: 1px solid #000000' frame='box' rules='all'>";
    /*pour individuels*/
    if($nbInscrits == 1){
        if($inscription['sexe']) {
            $sexe = ($inscription['sexe']['sexe'] =='H') ? $trad["ccn_form_homme"] : $trad["ccn_form_femme"];
            $messageSecretariat .= $this->addLine($trad["ccn_label_sexe"], $sexe , null);
        }
        $messageSecretariat .= $this->addLine($trad["ccn_label_nom"], $inscription['nom'] , null );
        $messageSecretariat .= $this->addLine($trad["ccn_label_prenom"], $inscription['surname']  , null);
        if(isset($inscription['nationality'])) $messageSecretariat .= $this->addLine($trad["ccn_form_nationalite"], $inscription['nationality'] , null );
        if(isset($inscription['birthdate'])) {
            $messageSecretariat .= $this->addLine($trad["ccn_label_dateNaiss"], date("d/m/Y",$inscription['birthdate']) , null );
            $messageSecretariat .= $this->addLine($trad["ccn_label_age_debut_proposition"], $this->getAge($inscription['birthdate'], $inscription['dateDebut'])." ". $trad["ccn_ans"] , null);
        }

        if(isset($inscription['profession'])) $messageSecretariat .= $this->addLine($trad["ccn_form_profession"], $inscription['profession']  , null);
        if(isset($inscription['classeEtudes'])) $messageSecretariat .= $this->addLine($trad["ccn_label_classeEtudes"], $inscription['classeEtudes'] , null );
        if(isset($inscription['facebook'])) $messageSecretariat .= $this->addLine("Facebook", $inscription['facebook'] , null );
        if(isset($inscription['situation'])) $messageSecretariat .= $this->addLine($trad["ccn_label_situation"], $inscription['situation'] , null );
        if(isset($inscription['tel2'])) $messageSecretariat .= $this->addLine($trad["ccn_form_telephone_portable"], $inscription['tel2'] , null );
        if(isset($inscription['tel2Pers2'])) $messageSecretariat .= $this->addLine($trad["ccn_form_telephone_portable_parent"], $inscription['tel2Pers2'] , null );
        $messageSecretariat .= $this->addLine($trad["ccn_label_email"], $inscription['email'] , null );
        if(isset($inscription['emailPers2'])) $messageSecretariat .= $this->addLine($trad["ccn_form_mail_parent"], $inscription['emailPers2'] , null );
        if(isset($inscription['country'])) $messageSecretariat .= $this->addLine($trad["ccn_label_pays"], $inscription['country'] , null );
        if(isset($inscription['address'])) $messageSecretariat .= $this->addLine($trad["ccn_label_adresse"], $inscription['address'] , null );
								$cpAndCity = "";
								if(isset($inscription['cp'])) $cpAndCity .= $inscription['cp'] . " - ";
								if(isset($inscription['city'])) $cpAndCity .= $inscription['city'] ;
        if(isset($inscription['cp']) || isset($inscription['city'])) $messageSecretariat .= $this->addLine($trad["ccn_label_codepostal"]. " - ".$trad["ccn_label_ville"], $cpAndCity , null );
        if(isset($inscription['tel1'])) $messageSecretariat .= $this->addLine($trad["ccn_form_telephone_fixe"], $inscription['tel1'] , null );

   }
    /*pour couple / fiances / familles*/
    if($nbInscrits == 2){
        if($inscription['situationConjugale']) $messageSecretariat .= $this->addLine($trad["ccn_form_situation_couple"], $inscription['situationConjugale'] );
        if($inscription['dateMariage']) $messageSecretariat .= $this->addLine($trad["ccn_form_date_de_mariage"], date("d/m/Y",$inscription['dateMariage']) );
        $messageSecretariat .= "<tr><td width=100% colspan=3>&nbsp;</td></tr>";
        $messageSecretariat .= $this->addLine($trad["ccn_label_nom"], $inscription['nom'],$inscription['nomPers2'] );
        $messageSecretariat .= $this->addLine($trad["ccn_label_prenom"], $inscription['surname'], $inscription['prenomPers2'] );
        $messageSecretariat .= $this->addLine($trad["ccn_form_nationalite"], $inscription['nationality'], $inscription['nationalitePers2'] );
        if($inscription['birthdate']) $messageSecretariat .= $this->addLine($trad["ccn_label_dateNaiss"], date("d/m/Y",$inscription['birthdate']), date("d/m/Y",$inscription['dateNaissPers2']) );
        if($inscription['birthdate'] || $inscription['dateNaissPers2']) {
            $messageSecretariat .= $this->addLine($trad["ccn_label_age_debut_proposition"], $this->getAge($inscription['birthdate'], $inscription['dateDebut'])." ". $trad["ccn_ans"], $this->getAge($inscription['dateNaissPers2'], $inscription['dateDebut'])." ". $trad["ccn_ans"]);
        }        
        if($inscription['profession']) $messageSecretariat .= $this->addLine($trad["ccn_form_profession"], $inscription['profession'], $inscription['professionPers2'] );
        $messageSecretariat .= "<tr><td width=100% colspan=3>&nbsp;</td></tr>";
        if($inscription['tel2']||$inscription['tel2Pers2']) $messageSecretariat .= $this->addLine($trad["ccn_form_telephone_portable"], $inscription['tel2'] , $inscription['tel2Pers2'] );
        $messageSecretariat .= $this->addLine($trad["ccn_label_email"], $inscription['email'], $inscription['emailPers2'] );
        $messageSecretariat .= "<tr><td width=100% colspan=3>&nbsp;</td></tr>";
        if($inscription['public_type'] == 'fiances') {
            $messageSecretariat .= $this->addLine($trad["ccn_label_pays"], $inscription['country'], $inscription['paysPers2'] );
            $messageSecretariat .= $this->addLine($trad["ccn_label_adresse"], $inscription['address'], $inscription['adressePers2'] );
            $messageSecretariat .= $this->addLine($trad["ccn_label_codepostal"]. " - ".$trad["ccn_label_ville"], $inscription['cp']." - ". $inscription['city'], $inscription['codepostalPers2']." - ". $inscription['villePers2'] );
            $messageSecretariat .= $this->addLine($trad["ccn_form_telephone_fixe"], $inscription['tel1'], $inscription['tel1Pers2'] );
        }
        else{
            $messageSecretariat .= $this->addLine($trad["ccn_label_pays"], $inscription['country'] );
            $messageSecretariat .= $this->addLine($trad["ccn_label_adresse"], $inscription['address'] );
            $messageSecretariat .= $this->addLine($trad["ccn_label_codepostal"]. " - ".$trad["ccn_label_ville"], $inscription['cp']." - ". $inscription['city'] );
            $messageSecretariat .= $this->addLine($trad["ccn_form_telephone_fixe"], $inscription['tel1'] );           
        }
   }
    $messageSecretariat .= "</table><br/>";
    /*Enfants*/
    if(isset($inscription['enfants']) && count($inscription['enfants'])>0) {
        $messageSecretariat .= "<table width=100% style='border: 1px solid #000000' frame='box' rules='all'>";
        $messageSecretariat .= "<tr><td bgcolor='#8CACBB' width=100% colspan=5><i>".$trad["ccn_label_enfants"]."</i></td></tr>";
        $messageSecretariat .="<tr><td bgcolor='#8CACBB' width=25%><i>" .$trad["ccn_label_prenom"]. "</i></td><td bgcolor='#8CACBB' width=25%><i>" .$trad["ccn_label_nom"]. "</i></td><td bgcolor='#8CACBB' width=25%><i>" .$trad["ccn_label_dateNaiss"]. "</i></td><td bgcolor='#8CACBB' width=10%><i>" .$trad["ccn_label_age"]. "</i></td><td bgcolor='#8CACBB' width=15%><i>" .$trad["ccn_label_sexe"]. "</i></td></tr>";
        foreach($inscription['enfants_org'] as $index => $enfant) {
            $messageSecretariat .= "<tr><td width=25%>". $enfant['prenom'] . "</td>";
            $messageSecretariat .= "<td width=25%>". $enfant['nom'] . "</td>";
            $messageSecretariat .= "<td width=25%>". $enfant['birthdateF'] . "</td>";
            $messageSecretariat .= "<td width=10%>". $this->getAge(strtotime($enfant['birthdate']), $inscription['dateDebut'])." ". $trad["ccn_ans"] . "</td>";
            $messageSecretariat .= "<td width=15%>". $enfant['sexe'] . "</td></tr>";
        }
        $messageSecretariat .= "</table><br/>";
    }
    /*QUESTIONS ET REMARQUES*/
    $messageSecretariat .= "<table width=100% style='border: 1px solid #000000' frame='box' rules='all'>";
    if(isset($inscription['logement'])) {
       $messageSecretariat .= $this->questionToRecap($inscription['logement_org']);
    }
    if(isset($inscription['transport'])) {
       $messageSecretariat .= $this->questionToRecap($inscription['transport_org']);
    }
    if(isset($inscription['complementaire'])) {
       $messageSecretariat .= $this->questionToRecap($inscription['complementaire_org']);
    }        
    if(isset($inscription['jai_connu'])){
       $messageSecretariat .= $this->questionToRecap($inscription['jai_connu_org']);
    }
    if(isset($inscription['remarques'])) {
       $messageSecretariat .= "<tr><td bgcolor='#8CACBB' width=33%><i>" . $trad["ccn_form_remarques"] . "</i></td><td width=67%>" .  $inscription['remarques'] . "</td></tr>";
    }
    $messageSecretariat .= "</table><br/>";
    /*INFOS DE PAIEMENT*/
    if($inscription['isPayment']) {
        $messageSecretariat .= "<table width=100% style='border: 1px solid #000000' frame='box' rules='all'>";
        $messageSecretariat .= $this->addLine($trad["ccn_label_mode_paiement"], $inscription['modePaiement'] , null );          
        $messageSecretariat .= $this->addLine($trad["ccn_label_montant_total_a_payer"], isset($inscription['montantTotalAPayerAvecMonnaie']) ? $inscription['montantTotalAPayerAvecMonnaie'] : 0, null );          
        $messageSecretariat .= $this->addLine($trad["ccn_label_montant_a_l_inscription"], $inscription['montantAPayerMaintenantAvecMonnaie'] , null );          
        $messageSecretariat .= "</table><br/>";
    }
    /*RECAP FINAL*/
    $messageSecretariat .= "<table width=100% style='border: 1px solid #000000' frame='box' rules='all'>";
    $messageSecretariat .= $this->addLine($trad["ccn_label_proposition"],  "<a href='" . $url . "'>" . $inscription['propositionTitre'] . "</a>" , null);          
    $messageSecretariat .= $this->addLine($trad["ccn_label_date"], $inscription['propositionDate'] , null);          
    $messageSecretariat .= $this->addLine($trad["ccn_label_lieu"], $inscription['propositionLieu'] , null );
    $messageSecretariat .= $this->addLine($trad["ccn_label_proposition"],  "<a href='" . $url . "'>" . $inscription['propositionTitre'] . "</a>" , null);          
    if(isset($inscription['codeOnesime'])) $messageSecretariat .= $this->addLine($trad["ccn_label_codeOnesime"], $inscription['codeOnesime'] , null );          
    $messageSecretariat .= "</table><br/>";
   
    
    
    $mailSecretariat = $mailerService->getNewMessage();
    $mailSecretariatCopy = array();
    if(isset($inscription['mails_secretariat'])) {
        foreach ($inscription['mails_secretariat'] as $mail){
            array_push($mailSecretariatCopy,$mail);
        }
        $mailSecretariat->setCc($mailSecretariatCopy); 
    }
    $mailSecretariat->setTo($inscription['contact']['email']); 
    $mailSecretariat->setFrom(array( "web@chemin-neuf.org" => ($inscription['surname']." ".$inscription['nom']))); 
    $mailSecretariat->setReplyTo(array($inscription['email'] => ($inscription['surname']." ".$inscription['nom']))); 
    $mailSecretariat->setCharset('utf-8');
    $mailSecretariat->setSubject($sujetSecretariat);
    $mailSecretariat->setBody($messageSecretariat, 'text/html', 'utf-8');
    $mailerService->sendMessage($mailSecretariat,$errors);    
    
}
    
    
    protected function subTokenFilter(&$token)
    {
        return array_intersect_key($token, array_flip(array('access_token', 'refresh_token', 'lifetime', 'createTime')));
    }
    
    protected function processInscription($inscription) {
        //dates avec +12h pour éviter problèmes
        if($inscription['birthdate']) $inscription['birthdate'] = strtotime($inscription['birthdate']) + 3600*12;
        if(isset($inscription['dateNaissPers2'])) $inscription['dateNaissPers2'] = strtotime($inscription['dateNaissPers2'])+ 3600*12;
        if(isset($inscription['dateMariage'])) $inscription['dateMariage'] = strtotime($inscription['dateMariage'])+ 3600*12;
        //telephones formatés pour la France
        if(Manager::getService("SitesConfigCcn")->getConfig()['paymentConfig']['nativePMConfig']['codePays'] == "FR"){
            if(isset($inscription['tel1'])) $inscription['tel1'] = $this->formatTelephone($inscription['tel1']);
            if(isset($inscription['tel2'])) $inscription['tel2'] = $this->formatTelephone($inscription['tel2']);
            if(isset($inscription['tel1Pers2'])) $inscription['tel1Pers2'] = $this->formatTelephone($inscription['tel1Pers2']);
            if(isset($inscription['tel2Pers2'])) $inscription['tel2Pers2'] = $this->formatTelephone($inscription['tel2Pers2']);
        }
        if(isset($inscription['logement'])) {
             $inscription['logement_org'] = $inscription['logement'];           
            $inscription['logement'] = $this->questionToAnswer($inscription['logement']);
        }
        if(isset($inscription['transport'])) {
             $inscription['transport_org'] = $inscription['transport'];           
            $inscription['transport'] = $this->questionToAnswer($inscription['transport']);
        }
        if(isset($inscription['complementaire'])) {
            $inscription['complementaire_org'] = $inscription['complementaire'];
            $inscription['questionsComplementaires'] = $this->questionToAnswer($inscription['complementaire']);
        }        
        if(isset($inscription['jai_connu'])){
            $inscription['jai_connu_org'] = $inscription['jai_connu'];
            $inscription['jai_connu'] = $this->questionToAnswer($inscription['jai_connu'], false);
        }
        if(isset($inscription['autreSituation'])){
            $inscription['situation'] .= " : ".$inscription['autreSituation'];
        }
        if(isset($inscription['enfants'])){
            $inscription['enfants_org'] = $inscription['enfants'];
            foreach ($inscription['enfants'] as $index => $enfant){
                $inscription['enfants'][$index] = $enfant['prenom']. " ".strtoupper($enfant['nom'])." ; ".$enfant['birthdateF']." ; ".$enfant['sexe'];
            }
        }
        if(isset($inscription['prenomPers2'])&&$inscription['prenomPers2']!="") {
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
                    foreach($reponse as $value) {
                        $answer .= $value['value'];
                        if(isset($value['complement']) && $value['complement'] != "" ) $answer .= " : " .$value['complement'];
                        $answer .=", ";
                    }
                }
                if($printTitre) $answer.="; ";
                
            }
            return $answer;
    }
    protected function questionToRecap($question){
        $stringToAdd="";
        foreach ($question as $titre => $reponse){
            $answer = "";
            if(is_string($reponse)) $answer= $reponse; // pour texte ou radio
            else {
                foreach($reponse as $value) {//pour checkbox
                    $answer .= $value['value'];
                    if(isset($value['complement']) && $value['complement'] != "" ) $answer .= " : " .$value['complement'];
                    $answer .=", ";
                }
                   
            }
            $stringToAdd .= "<tr><td bgcolor='#8CACBB' width=33%><i>" .$titre . "</i></td><td width=67%>" . $answer . "</td></tr>";
        }
        return $stringToAdd;
    }
    protected function addLine($titre, $reponse, $reponse2){
        if(isset($reponse2)) return "<tr><td bgcolor='#8CACBB' width=33%><i>" .$titre . "</i></td><td width=33%>" . $reponse . "</td><td width=33%>".$reponse2 ."</td></tr>";
        else return "<tr><td bgcolor='#8CACBB' width=33%><i>" .$titre . "</i></td><td width=67% colspan=2>" . $reponse . "</td></tr>";
    }
    
    protected function getAge($dateDebut, $dateFin){ // avec dates passées par strtotime (ie timestamp)
        return floor(($dateFin-$dateDebut) / (365*60*60*24));
    }
    
    protected function formatTelephone($number){
        $toReplace = array(" ", "/", "+");
        $telephoneFormat = str_replace($toReplace,"",$number); //supprimer espace, + et /
        //336xxxxxxxx
        if(strlen($telephoneFormat) == 11) {
            $telephoneFormat = "+".substr($telephoneFormat, 0,2)."/".substr($telephoneFormat, 2,1)." ".substr($telephoneFormat, 3,2)." ".substr($telephoneFormat, 5,2)." ".substr($telephoneFormat, 7,2)." ".substr($telephoneFormat, 9,2);
        }
        //00336xxxxxxxx
        else if(strlen($telephoneFormat) == 13 && substr($telephoneFormat, 0,2) == "00") {
            $telephoneFormat = "+".substr($telephoneFormat, 2,2)."/".substr($telephoneFormat, 4,1)." ".substr($telephoneFormat, 5,2)." ".substr($telephoneFormat, 7,2)." ".substr($telephoneFormat, 9,2)." ".substr($telephoneFormat, 11,2);
        }
        else if(strlen($telephoneFormat) == 10 && substr($telephoneFormat, 0,1) == "0") {
            $telephoneFormat = "+33/".substr($telephoneFormat, 1,1)." ".substr($telephoneFormat, 2,2)." ".substr($telephoneFormat, 4,2)." ".substr($telephoneFormat, 6,2)." ".substr($telephoneFormat, 8,2);
        }
        return $telephoneFormat;
    }
    
    private function translate($string,$toReplaceArray,$toReplaceWithArray)
    {
								return str_replace($toReplaceArray,$toReplaceWithArray,$string);
    }

protected function localizableFields($type, $fields)
    {
        $existingFields = array();
        foreach ($type['fields'] as $field) {
            if ($field['config']['localizable']) {
                $existingFields[] = $field['config']['name'];
            }
        }
        foreach ($fields as $key => $value) {
            unset($value); //unused
            if (!(in_array($key, $existingFields) || in_array($key, array('text', 'summary')))) {
                unset ($fields[$key]);
            }
        }
        return $fields;
    }
				
    
 protected function formatFieldData($value, $cType = null)
    {
        switch ($cType) {
            case 'Ext.form.field.Date':
            case 'datefield':
                return date('d-m-Y H:i:s', $value);
                break;
            case 'Ext.form.RadioGroup':
            case 'radiogroup':
            case 'Ext.form.field.ComboBox':
            case 'combobox':
                if (is_array($value)) {
                    return implode(", ", $value);
                } else {
                    return $value;
                }
                break;
            case 'localiserField':
            case 'Rubedo.view.localiserField':
                if (isset($value["lat"])&&isset($value["lon"])){
                    $stringLat= (string) $value["lat"];
                    $stringLon= (string) $value["lon"];
                    return($stringLat.",".$stringLon);
                } else {
                    return "";
                }
                break;
            default:
                return ($value);
                break;
        }
    }				
				
				
				/**
     * Define the resource
     */
    protected function define()
    {
        $this
            ->definition
            ->setName('Inscription')
            ->setDescription('Service d\'inscription')
            ->editVerb('get', function (VerbDefinitionEntity &$definition) {
                $this->defineGet($definition);
            })
            ->editVerb('post', function (VerbDefinitionEntity &$definition) {
                $this->definePost($definition);
            });
        
    }
				
   protected function defineGet(VerbDefinitionEntity &$definition)
    {
        $definition
            ->setDescription('Get Excel list of registrations')
												->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('startDate')
                    //->setRequired()
                    ->setDescription('Start date')
            )
												->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('endDate')
                    //->setRequired()
                    ->setDescription('End date')
            )
												->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('propositionId')
                    ->setDescription('ID de la proposition')
                    ->setFilter('\\MongoId')
            )
            ->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('path')
                    ->setDescription('Fichier temporaire')
            );
    }


				protected function definePost(VerbDefinitionEntity &$definition)
    {
        $definition
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
																	->addOutputFilter(
																				(new FilterDefinitionEntity())
																								->setDescription('Numéro d\'inscription')
																								->setKey('id')
																)
																->addOutputFilter(
																				(new FilterDefinitionEntity())
																								->setDescription('résultat')
																								->setKey('result')
																);
				}

     

}     
