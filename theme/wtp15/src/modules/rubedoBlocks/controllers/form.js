angular.module("rubedoBlocks").lazy.controller('FormController',['$scope','$http','$location','$sce','RubedoContactService',function($scope,$http,$location,$sce,RubedoContactService){
    var me = this;
    var config = $scope.blockConfig;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    me.detailTemplate=themePath+'/templates/blocks/form/form_fr.html';
    if(config.lang&&config.lang!=""){
        $http.get(themePath+'/templates/blocks/form/form_'+config.lang+".html").then(
            function (response){
                me.detailTemplate=themePath+'/templates/blocks/form/form_'+config.lang+".html";
            }
        )
    };
    me.registration_status = $location.search().status; 

    
    me.showForm=true;
    me.contactData={ };
    me.contactError=null;
    if (config.mailingListId){
        me.showForm=true;
    }
    $http.get('/theme/wtp15/elements/tarifs.json').then(function(res){
          $scope.tarifs = res.data;                     
        });
       
    me.inscription={};
    me.inscription.step='1';
    me.inscription.registrationStep = '0';
    me.inscription.festival=true;
    me.inscription.formule="festival";
    me.inscription.parcours="carte";
    me.inscription.retraite=false;
    me.inscription.dates='1';
    me.inscription.sex = 'H';
    me.inscription.situation = 'etudiant';
    me.inscription.prix_formule = 50;
    me.inscription.prix_total = 50;
    me.inscription.prix_transport=0;
    me.inscription.prix_logement=0;
    me.inscription.montant_a_payer=0;
    me.action='http://www.chemin-neuf.fr/jeunes-fr/18-30-ans/hautecombe-2015-festival-international/festival-hautecombe/'+me.inscription.formule+'/formulaire_general2';
    me.process = false;
    me.updateStatus = function(){
        if (me.inscription.festival) {
            switch (me.inscription.dates) {
                   case "1" : me.inscription.formule="festival"; break;
                   case "2" : me.inscription.formule="prepa"; break;
                   case "3" : me.inscription.formule="volontaire"; break;
            }
            if (me.inscription.retraite) {
                me.inscription.formule+="-retraite";
            }
        }    

       else if(me.inscription.retraite) me.inscription.formule="retraite";
       if(config.lang="fr") me.action='http://www.chemin-neuf.fr/jeunes-fr/18-30-ans/hautecombe-2015-festival-international/festival-hautecombe/'+me.inscription.formule+'/formulaire_general2';
       
       if(config.lang="en") me.updatePriceEn();
    };
    
    
    me.updatePrice = function() {
        if (me.inscription.tarif) {
            
        switch (me.inscription.tarif.match(/^etudiant|^jeune-pro|^reduit|^solidarite/)[0]) {
            case( "etudiant" ) : me.inscription.prix_formule = $scope.tarifs[me.inscription.formule].etudiant; break;
            case ("jeune-pro") : me.inscription.prix_formule =  $scope.tarifs[me.inscription.formule].jpro; break;
            case ("reduit") : me.inscription.prix_formule =  $scope.tarifs[me.inscription.formule].reduit; break;
            case ("solidarite") : me.inscription.prix_formule =  $scope.tarifs[me.inscription.formule].solidarite; break;
        }
        }
        switch(me.inscription.aller){
            case "2":me.inscription.prix_transport = 5;break;
            case "3":me.inscription.prix_transport = 49;break;
            default:me.inscription.prix_transport =0;
        }

        switch (me.inscription.retour) {
            case "2":me.inscription.prix_transport+=5;break;
            case "3":me.inscription.prix_transport+=49;break;
            default: me.inscription.prix_transport+=0;
        }
        if (me.inscription.bus_ar) {
            me.inscription.prix_transport+=80;
        }
        
        if (me.inscription.logement==1) {
            me.inscription.prix_logement = 15;
        }
       if (me.inscription.logement!=1) {
            me.inscription.prix_logement = 0;
        }
        me.inscription.prix_total = me.inscription.prix_formule+me.inscription.prix_transport+me.inscription.prix_logement;
        
     }
     me.updatePaf = function() {
        switch (me.inscription.paiement) {
            case("fraisDInscription") : me.inscription.montant_a_payer = 50;break;
            case("partie") : me.inscription.montant_a_payer = me.inscription.montant_partie;break;
            case("totalite") : me.inscription.montant_a_payer = me.inscription.prix_total;break;
                
        }
     }
    
     me.updatePriceEn = function() {
       
        if (me.inscription.logement=='rent') {
            me.inscription.prix_logement = $scope.tarifs[me.lang].tente;
        }
       if (me.inscription.logement!='rent') {
            me.inscription.prix_logement = 0;
        }
        if (me.inscription.bus_pl) {
           me.inscription.prix_transport = 460;
        }
        if (!me.inscription.bus_pl) {
           me.inscription.prix_transport = 0;
        }
       me.price_min = $scope.tarifs[me.lang][me.inscription.formule].min + me.inscription.prix_logement + me.inscription.prix_transport;
        me.price_max = $scope.tarifs[me.lang][me.inscription.formule].max + me.inscription.prix_logement + me.inscription.prix_transport;
        me.price_moy = (me.price_min+me.price_max)/2;
        me.inscription.payment = me.price_moy;
        
     }
     
     
     me.updatePaf = function() {
        switch (me.inscription.paiement) {
            case("fraisDInscription") : me.inscription.montant_a_payer = 50;break;
            case("partie") : me.inscription.montant_a_payer = me.inscription.montant_partie;break;
            case("totalite") : me.inscription.montant_a_payer = me.inscription.prix_total;break;
                
        }
     }
     
     
 
  
    me.preRegister=function(){
        me.contactError=null;
        var mailInfo={};
        var formule = $scope.tarifs[me.inscription.formule].text;

        mailInfo.email=me.inscription.email;
        mailInfo.subject = "Préinscription au Festival - "+me.inscription.surname+" "+me.inscription.name;
        mailInfo["Prénom"]= me.inscription.surname;
        mailInfo["Nom"]=me.inscription.name;
        mailInfo["Sexe"]=me.inscription.sex;
        mailInfo["Code postal"]=me.inscription.cp;
        mailInfo["Date de naissance"]=me.inscription.birthdate;
        mailInfo["Téléphone"]=me.inscription.telephone;
        mailInfo["Mail"]=me.inscription.email;
        mailInfo["Formule"]=formule;

        var payload={
            mailingListId:config.mailingListId,
            from:mailInfo.email,
            subject:mailInfo.subject
        };
        
        delete (mailInfo.email);
        delete (mailInfo.subject);
        payload.fields=mailInfo;
        if (me.inscription.email != me.inscription.email_verif) {
            me.showMailError=true;
        }
        else {
        RubedoContactService.sendContact(payload).then(
            function(response){
                if (response.data.success){
                    me.mailInfo={ };
                    me.showForm=false;
                    me.registration_status='preinscription';
                } else {
                    me.contactError=response.data.message;
                    me.showPreRegisterError=true;

                }
            },
            function(response){
                me.contactError=response.data.message;
            }
        );
        }
    };

             
        me.lang="en";
        me.chooseLang=function(){
             switch (me.inscription.country) {
               case("FRANCE") : me.lang="fr"; break;
               case("BELGIUM") : me.lang="be"; break;
               case("BULGARIA") : me.lang="bg"; break;
               case("BRAZIL") : me.lang="br"; break;
               case("CANADA") : me.lang="ca"; break;
               case("CZECH REPUBLIC") : me.lang="cz"; break;
               case("EGYPT") : me.lang="eg"; break;
               case("GERMANY") :me.lang="de"; break;
               case("HUNGARY") : me.lang="hu"; break;
               case("ITALY") : me.lang="it"; break;
               case("LATVIA") : me.lang="lv"; break;
                case("LITHUANIA") : me.lang="lt"; break;
               case("LEBANON") : me.lang="lb"; break;
               case("NETHERLANDS") : me.lang="nl"; break;
               case("POLAND") : me.lang="pl"; break;
               case("RUSSIA") : me.lang="ru"; break;
               case("SLOVAKIA") : me.lang="sk"; break;
               case("SLOVENIA") : me.lang="si"; break;
               case("SPAIN") : me.lang="es"; break;
               case("SWITZERLAND") : me.lang="ch"; break;
               case("UNITED KINGDOM") : me.lang="gb"; break;
               case("") : me.lang="other"; break;
            }
            me.inscription.step=2;
            me.updatePriceEn();
           
        }

        
        me.register=function(){
           me.contactError=null;
            var mailInfo={};
            mailInfo.subject = "[wtp2015-"+me.lang+"] Registration to WTP2015";
            
            var formule_en = $scope.tarifs[me.inscription.formule].text_en;
    
            mailInfo.formule = formule_en;
            mailInfo.parcours = me.inscription.parcours ? me.inscription.parcours :" ";
            mailInfo.volontariat = me.inscription.volontariat?me.inscription.volontariat:" ";
            mailInfo.name = me.inscription.name;
            mailInfo.surname = me.inscription.surname;
            mailInfo.birthdate = me.inscription.birthdate;
            mailInfo.sex = me.inscription.sex;
            mailInfo.cp = me.inscription.cp;
            mailInfo.email = me.inscription.email;
            mailInfo.telephone = me.inscription.telephone;
            mailInfo.nationality = me.inscription.nationality ? me.inscription.nationality:" ";
            mailInfo.address = me.inscription.address;
            mailInfo.city = me.inscription.city;
            mailInfo.country = me.inscription.country;
            mailInfo.situation = me.inscription.situation;
                if(me.inscription.situationAutre) mailInfo.situation+= " : "+me.inscription.situationAutre;            
            mailInfo.confession = me.inscription.confession;
                if(me.inscription.confession_autre) mailInfo.confession+= " : "+me.inscription.confession_autre;            
            mailInfo.connu="";
                if(me.inscription.fb)  mailInfo.connu+="Facebook, YouTube, ";
                if(me.inscription.tract)  mailInfo.connu+="Leaflets, press, ";
                if(me.inscription.google)  mailInfo.connu+="Google, ";
                if(me.inscription.famille)  mailInfo.connu+="My family / friends, ";
                if(me.inscription.paroisse)  mailInfo.connu+="Chaplaincy / parish, ";
                if(me.inscription.gp)  mailInfo.connu+="Prayer group, Community weekends, ";
            /*mailInfo.transport_aller=me.inscription.aller;
                if(me.inscription.aller_train_gare) mailInfo.transport_aller+= " : " +me.inscription.aller_train_gare;
                if(me.inscription.aller_train_date)  mailInfo.transport_aller+= ", "+me.inscription.aller_train_date;
                if(me.inscription.aller_train_heure)  mailInfo.transport_aller+=" "+me.inscription.aller_train_heure;
            mailInfo.transport_retour=me.inscription.retour;
                if(me.inscription.retour_train_gare) mailInfo.transport_retour+= " : " +me.inscription.retour_train_gare;
                if(me.inscription.retour_train_date)  mailInfo.transport_retour+= ", "+me.inscription.retour_train_date;
                if(me.inscription.retour_train_heure)  mailInfo.transport_retour+=" "+me.inscription.retour_train_heure;*/
            mailInfo.transport="";
            if (me.inscription.bus_pl) {
               mailInfo.transport="Bus with the Community";
            }
            mailInfo.logement = me.inscription.logement;
            mailInfo.groupe = me.inscription.groupe ?me.inscription.groupe:" ";
            mailInfo.remarques = me.inscription.remarques ? me.inscription.remarques:" ";
            mailInfo.payment = me.inscription.payment + $scope.tarifs[me.lang].currency;
            if (me.lang=='lb' || me.lang=='other') {
                mailInfo.payment = "No specified price for this country "
            }


            var payload={
                mailingListId:config.mailingListId,
                from:me.inscription.email,
                subject:mailInfo.subject
            };

            payload.fields=mailInfo;
            payload.template = themePath+'/emails/registration.html';
            payload.to = {
                "Secrétariat JMJ" : "jeunes@chemin-neuf.org",
                "Arnaud BONNASSIES" : "arnaud.bonnassies@chemin-neuf.org",
                "Patricia PLACE" : "patricia.place@chemin-neuf.org",
                "Paula COSTA" : "pax.loureiro@gmail.com",
                "Mission Jeunes France" : "inscriptions.mj@gmail.com"
            };

            
            switch(me.lang) {
                case("be") : payload.to["Secrétariat Belgique"]="muriel.ccn@gmail.com";break;
                case("br") : payload.to["Secrétariat Brésil"]="anneclaire.truchot@gmail.com";break;
                case("cz") : payload.to["Christophe JACOB"]="christophe.jakob@gmail.com";
                                    payload.to["Bianca MAIER"]="bianca.maier@wanadoo.fr";
                                    payload.to["Secrétariat"] = "sekretariat.mladezeccn@gmail.com";break;
                /*CANADA ?*/
                /*EGYPT*/
                case("de") : payload.to["Gerold JAEGER"]="gerold.jaeger@chemin-neuf.de";payload.to["Annadeline BURGNARD"]="annadeline@gmail.com ";break;
                case("hu") : payload.to["Nolwenn MASSON"]="masson.nolwenn@yahoo.fr";
                                    payload.to["Kata GYORI"]="kata.gyori@chemin-neuf.org";
                                    payload.to["Aron SISAK"]="asisak@gmail.com ";break;
                case("it") : payload.to["Antonio ACHILLE"]="ant.achille91@gmail.com";break;
                case("lv") : payload.to["Nils JANSONS"]="nils.jansons@gmail.com";
                                    payload.to["Inese MOTTE"]="inesemotte@yahoo.fr";
                                    payload.to["Madara SINKE"]="madara.sinke@gmail.com"; break;
                case("lb") : payload.to["Saba SAMAR"]="saba_samar@yahoo.com";break;
                case("nl") : payload.to["Gabriel MUELLER"]="gabriel.mueller@chemin-neuf.org";break;
                case("pl") : payload.to["Emmanuel PROIX"]="emmanuel.proix@chemin-neuf.org";
                                    payload.to["Ania SWIECKA"]=" aniaswiecka@hotmail.com";
                                    payload.to["Secrétariat"]="violaz@wp.pl";
                                    payload.to["Secretariat Mission Jeunes"]="mlodzi@chemin-neuf.pl"; break;
                case("ru") : payload.to["Norbert ROUSSELLE"]="norbert.rousselle@chemin-neuf.org";
                                    payload.to["Ludmila MAMPOUYA"]="ludmilabro@gmail.com";break;
                case("sk") : payload.to["Christophe JACOB"]="christophe.jakob@gmail.com";break;
                case("es") : payload.to["Sibylle WISSERMANN"]="sibywi@yahoo.fr";
                                    payload.to["Vincent BREYNAERT"]="vincent.breynaert@wanadoo.fr ";break;
                case("ch") :  payload.to["Séverine de MONTCLOS"]="sr.severine@haus-bethanien.ch";break;
                case("gb") : payload.to["Katie BECKER"]="katie.becker@chemin-neuf.org";
                                    payload.to["Valérie DUQUESNOY"]="valeried95@hotmail.com";
                                    payload.to["Kate MARTIN"]="katemartin_au@yahoo.com.au"; break;
            }
            
           
            
            if (me.inscription.email != me.inscription.email_verif) {
                me.showMailError=true;
            }
            
            else {
                me.process = true;
            RubedoContactService.sendContact(payload).then(
                function(response){
                    if (response.data.success){
                        me.mailInfo={ };
                        me.showForm=false;
                        me.showConfirmRegister=true;
                        me.process=false;
                    } else {
                        me.contactError=response.data.message;
                        me.showRegisterError=true;
    
                    }
                },
                function(response){
                    me.contactError=response.data.message;
                }
            );
        }
    };
  
    
    me.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
  }
    me.getFlagUrl = function(flagCode){
            return '/assets/flags/64/'+flagCode+'.png';
        };

}]);
