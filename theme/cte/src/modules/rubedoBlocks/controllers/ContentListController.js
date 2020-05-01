angular.module("rubedoBlocks").lazy.controller("ContentListController",['$scope','$compile','RubedoContentsService',"$route","RubedoContentTypesService","RubedoPagesService","TaxonomyService","$location","$sce",function($scope,$compile,RubedoContentsService,$route,RubedoContentTypesService,RubedoPagesService,TaxonomyService,$location,$sce){
    
    var me = this;
    me.contentList=[];
    var config=$scope.blockConfig;
    var blockPagingIdentifier=$scope.block.bType+$scope.block.id.substring(21)+"Page";
    var pageId=$scope.rubedo.current.page.id;
    var siteId=$scope.rubedo.current.site.id;
    var alreadyPersist = false;
    me.contentHeight = config.summaryHeight?config.summaryHeight:80;
    me.start = config.resultsSkip?config.resultsSkip:0;
    me.limit = config.pageSize?config.pageSize:12;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    me.template_actus_fr = themePath+"/templates/blocks/contentList/actus_fr.html";
    me.template_actus = themePath+"/templates/blocks/contentList/actus.html";
    me.template_foi = themePath+"/templates/blocks/contentList/foi.html";
    me.template_home = themePath+"/templates/blocks/contentList/home.html";
    me.template_experience = themePath+"/templates/blocks/contentList/experiences.html";
    me.query="";
    me.taxoFilter="";
    me.filter = function(taxoTerm){
        if(me.taxoFilter != taxoTerm) me.taxoFilter = taxoTerm;
        else me.taxoFilter = "";
        options['start'] += options['limit'];
        options['limit'] = 100;
        if (!me.count || me.count > options['start']) {
            me.getContents(config.query, pageId, siteId, options, true);
        }
        
    }
    var urlCurrentPage=$location.search()[blockPagingIdentifier];
    if (urlCurrentPage){
        me.start=(urlCurrentPage-1)*me.limit;
    }
    var options = {
        start: me.start,
        limit: me.limit,
        'fields[]' : ["text","summary","image","propositionReferencee","propositionReferenceeInterne","nom","position","dateDebut","dateFin","positionName","complement_date","video","subTitle","date"]
    };
    if(config.singlePage){
        options.detailPageId = config.singlePage;
    }
    if(config.showPastDates) {
        options.date=Math.round(new Date().getTime()/1000);
        options.dateFieldName="dateDebut";
        options.endDate = Math.round( (new Date().getTime() + 2*(3600000*24*365))/1000); //ajouter 2 ans pour la date de fin
        options.endDateFieldName="dateFin";
    }
    if(config.enableFOContrib&&$scope.rubedo.current.user&&$scope.rubedo.current.user.rights.canEdit){
        //options.foContributeMode = true;   ENABLE to filter contents by user
        options.useDraftMode=true;
        me.isFOContributeMode=true;
        if (config.editorPageId){
            RubedoPagesService.getPageById(config.editorPageId).then(function(response){
                if (response.data.success){
                    me.editorPageUrl=response.data.url;
                }
            });
        }
    }

    // ====================================================================
    /**
     * Here we prepare special display condition :
     * If we set blockConfig.enableContext to true, we display the contentList only if
     * 
     */
    me.fromUrl = ($location.search()['from'] || '').replace(/https?\:\/\/[^\/]+\//, "/").replace(/\/$/, "");;
    console.log("contentListCtrl", me);
    me.contextUrl = "";
    RubedoPagesService.getPageById(config.singlePage).then(function(response){
        if (response.data.success){
            me.contextUrl = response.data.url.replace(/\/$/, "");
            console.log("got config page associée : ", response.data)
            console.log("conditional display = ", !config.enableContext || me.fromUrl == me.contextUrl)
        }
    });
    // ====================================================================

    me.titleOnly = config.showOnlyTitle;
    me.columns = config.columns && !config.infiniteScroll ? 'col-md-'+(12/config.columns):'col-md-12';
    me.showPaginator = config.showPager && !config.infiniteScroll;
    me.changePageAction = function(){
        options.start = me.start;
        $location.search(blockPagingIdentifier,(me.start/me.limit)+1);
        me.getContents(config.query, pageId, siteId, options);
    };
    $scope.$on('$routeUpdate', function(){window.location.reload();});
    $scope.$watch('rubedo.fieldEditMode', function(newValue) {
        alreadyPersist = false;
        me.showPaginator = newValue ? false : config.showPager && !config.infiniteScroll;
        if (newValue&&me.queryType&&me.queryType=="manual"&&!me.creatableContentTypes){
            RubedoContentTypesService.getContentTypes().then(
                function(response){
                    if (response.data.success){
                        me.creatableContentTypes=response.data.contentTypes;
                        if (response.data.contentTypes.length>0){
                            me.selectedManualType=response.data.contentTypes[0].id;
                        }

                    }
                }
            );
        }
    });
    if (config.infiniteScroll){
        me.limit = options['limit'];
        me.blockStyle = {
            height: (me.limit * me.contentHeight - me.contentHeight)+'px',
            'overflow-y': 'scroll'
        };
        me.timeThreshold = config['timeThreshold'] ? config['timeThreshold']:200;
        me.scrollThreshold = config['scrollThreshold'] ? config['scrollThreshold']:300;
    } else {
        me.blockStyle = {
            'overflow-y': 'visible'
        };
    }
    me.getTermInTaxo=function(termId){
        if(!me.taxo){return(null);} // pas de taxonomie pour ce type de contenu
        var term=null;
        angular.forEach(me.taxo,function(candidate){ // chercher l'id dans les taxonomies de ce type de contenu si 
            if(!term){
                if(candidate.id==termId && candidate.parentId!='root'){term=candidate.text;}
            }
         });
        return(term);
    }

    me.getContents = function (queryId, pageId, siteId, options, add){
        RubedoContentsService.getContents(queryId,pageId,siteId, options).then(function(response){
            if (response.data.success){
                me.count = response.data.count;
                me.queryType=response.data.queryType;
                me.usedContentTypes=response.data.usedContentTypes;
                me.contents = response.data.contents;
                var columnContentList = [];
                if (add){
                    angular.forEach(response.data.contents,function(newContent){
                        columnContentList.push(newContent);
                    });
                    me.contentList.push(columnContentList);
                    $scope.clearORPlaceholderHeight();
                } else {
                    me.contentList=[];
                    angular.forEach(response.data.contents,function(newContent, key){
                        columnContentList.push(newContent);
                        if(config.columns && (key+1) % (Math.ceil(response.data.contents.length/config.columns)) == 0){
                            me.contentList.push(columnContentList);
                            columnContentList = [];
                        }
                    });
                    if (columnContentList.length > 0){
                        me.contentList.push(columnContentList);
                    }
                    $scope.clearORPlaceholderHeight();
                }
                /*taxonomies pour propositions*/
                if (me.usedContentTypes[0]=="54dc614245205e1d4a8b456b") {
                     var taxonomiesArray ={};
                     taxonomiesArray[0]="555f3bc445205edc117e689b";// taxcnomie de propositions
                    TaxonomyService.getTaxonomyByVocabulary(taxonomiesArray).then(function(response){
                         if(response.data.success){
                            var tax = response.data.taxo;
                            
                            me.taxo={};
                            angular.forEach(tax, function(taxonomie){
                                me.taxo = taxonomie.terms;
                            });
                         }
                         
                     });
                }
            }
        });
    };
    me.canAddToList=function(){
        return ($scope.rubedo.fieldEditMode&&me.queryType&&(me.queryType=="simple"||me.queryType=="manual"));
    };
    me.launchContribute=function(){
        if ($scope.rubedo.fieldEditMode){
            if (me.queryType=="simple"){
                me.displayEditorModal(me.usedContentTypes[0]);
            } else if (me.queryType=="manual"&&me.selectedManualType){
                me.displayEditorModal(me.selectedManualType);
            }

        }
    };
    me.displayEditorModal=function(typeId){
        var modalUrl = "/backoffice/content-contributor?typeId=" + typeId + "&queryId=" + config.query + "&current-page=" + $scope.rubedo.current.page.id + "&current-workspace=" + "global" +"&workingLanguage="+$route.current.params.lang;
        var availHeight=window.innerHeight*(90/100);
        var properHeight=Math.max(400,availHeight);
        var iframeHeight=properHeight-10;
        angular.element("#content-contribute-frame").empty();
        angular.element("#content-contribute-frame").html("<iframe style='width:100%;  height:"+iframeHeight+"px; border:none;' src='" + modalUrl + "'></iframe>");
        angular.element('#content-contribute-modal').appendTo('body').modal('show');
        window.confirmContentContribution=function(){
            angular.element("#content-contribute-frame").empty();
            angular.element('#content-contribute-modal').modal('hide');
            $scope.rubedo.addNotification("success","Success","Contents created.");
            me.getContents(config.query, pageId, siteId, options, false);
        };
        window.cancelContentContribution=function(){
            angular.element("#content-contribute-frame").empty();
            angular.element('#content-contribute-modal').modal('hide');
        };
    };
    $scope.loadMoreContents = function(){
        if (options['start'] + options['limit'] < me.count && !$scope.rubedo.fieldEditMode){
            options['start'] += options['limit'];
            me.getContents(config.query, pageId, siteId, options, true);
        }
    };
    $scope.persistAllChanges = function(){
        var contentsToPerist = [];
        var keysContent = [];
        if(!alreadyPersist){
            angular.forEach($scope.rubedo.registeredEditCtrls, function(contentCtrl){
                if(contentCtrl.index || contentCtrl.index === 0){
                    delete (contentCtrl.content.type);
                    contentsToPerist.push(contentCtrl.content);
                    keysContent.push({
                        index: contentCtrl.index,
                        parentIndex: contentCtrl.parentIndex
                    });
                }
            });
            RubedoContentsService.updateContents(contentsToPerist).then(
                function(response){
                    if (response.data.success){
                        var notUpdateContents = [];
                        angular.forEach(response.data.versions, function(version, key){
                            if(version){
                                me.contentList[keysContent[key]['parentIndex']][keysContent[key]['index']]['version'] = version;
                            } else {
                                notUpdateContents.push(me.contentList[keysContent[key]['parentIndex']][keysContent[key]['index']]['fields']['text']);
                            }
                        });
                        if (notUpdateContents.length === 0){
                            $scope.rubedo.addNotification("success","Success","Contents updated.");
                        } else {
                            $scope.rubedo.addNotification("warning","Warning","Some contents have not been updated",6000);
                            angular.forEach(notUpdateContents, function(notUpdate){
                                $scope.rubedo.addNotification("danger","Error","Contents update error : "+notUpdate, 6000);
                            });
                        }
                    } else {
                        $scope.rubedo.addNotification("danger","Error","Contents update error.");
                    }

                },
                function(response){
                    $scope.rubedo.addNotification("danger","Error","Contents update error.");
                }
            );
            alreadyPersist = true;
        }
    };
    if(config.query){
        if (config.enableContext){
            var routeSegments=$route.current.params.routeline.split("/");
            var detectedId=null;
            angular.forEach(routeSegments,function(segment){
                if (mongoIdRegex.test(segment)){
                    detectedId=segment;
                }
            });
            if (detectedId){
                options.contextContentId=detectedId;
                options["contextualTaxonomy[]"]=config.contextualTaxonomy;
                options.contextualTaxonomyRule=config.contextualTaxonomyRule;
            }
        }
        me.getContents(config.query, pageId, siteId, options, false);
    }
    me.launchFOContribute=function(){
        if(me.editorPageUrl){
            $location.url(me.editorPageUrl);
        }
    }
    me.getTaxonomyTerms = function(vocId){
        var taxonomiesArray ={};
        taxonomiesArray[0]=vocId;
        TaxonomyService.getTaxonomyByVocabulary(taxonomiesArray).then(function(response){
            if(response.data.success){
                me.taxonomyTerms = {};
                angular.forEach(response.data.taxo, function(taxonomie){
                    me.taxonomyTerms["name"] = taxonomie.vocabulary.name;
                    me.taxonomyTerms["terms"] = taxonomie.terms;
                });
                return true;
            }
            else return false
                         
        });
        
    }
    // fonction pour mettre un contenu hors-ligne
    me.putOffline = async function(event, content_id) {
        event.preventDefault();
        if (!confirm("Es-tu sûr(e) de vouloir mettre ce contenu offline ?")) return;
        // on récupère le contenu tout frais
        let res;
        try {
            res = await RubedoContentsService.getContentById(content_id);
        } catch(e) {
            console.log("Erreur dans putOffline en essayant de récupérer le contenu " + content_id)
            $scope.rubedo.addNotification("danger",$scope.rubedo.translate("Block.Error", "Error !"),$scope.rubedo.translate("Blocks.Contrib.Status.UpdateError", "Content update error"));
            return
        }
        console.log('PO', res)
        if (!res.data.success) {
            console.log("PutOffline erreur", content_id, res)
            $scope.rubedo.addNotification("danger",$scope.rubedo.translate("Block.Error", "Error !"),$scope.rubedo.translate("Blocks.Contrib.Status.UpdateError", "Content update error"));
            return
        }
        // on le met à jour avec online = false;
        let content_full = angular.copy(res.data.content);
        try {
            content_full.online = false;
            res = await RubedoContentsService.updateContent(content_full);
            $scope.rubedo.addNotification("success",$scope.rubedo.translate("Block.Success", "Success !"),$scope.rubedo.translate("Blocks.Contrib.Status.ContentUpdated", "Content updated"));
        } catch(e) {
            $scope.rubedo.addNotification("danger",$scope.rubedo.translate("Block.Error", "Error !"),$scope.rubedo.translate("Blocks.Contrib.Status.UpdateError", "Content update error"));
            return
        }
        console.log("putoffline success", res);
    }

    // For Youtube videos player
    $scope.get_youtube_embed_url = function(url) {
        if (!/youtu\.?be/.test(url)) return url;
        let res = /[^\/=&]+?$/.exec(url);
        if (!res.length) return url;
        let id = res[0];
        return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + id + '?autoplay=0');
    }
    
    
}]);
angular.module("rubedoBlocks").lazy.controller("ContentListDetailController",['$scope','$compile','RubedoContentsService','RubedoPagesService',function($scope,$compile,RubedoContentsService,RubedoPagesService){
    var me = this;
    me.index = $scope.$index;
    me.parentIndex = $scope.columnIndex;
    me.content = $scope.content;
    $scope.fieldEntity=angular.copy(me.content.fields);
    $scope.fieldLanguage=me.content.locale;
    $scope.fieldInputMode=false;
    $scope.$watch('rubedo.fieldEditMode', function(newValue) {
        $scope.fieldEditMode=$scope.content.content&&me.content.readOnly ? false : newValue;

    });
    me.registerEditChanges=function(){
        $scope.rubedo.registerEditCtrl(me);
    };
    me.persistChanges = function(){
        me.content.fields = angular.copy($scope.fieldEntity);
        $scope.$parent.$parent.$parent.persistAllChanges();
    };
    me.revertChanges = function(){
      $scope.fieldEntity = angular.copy(me.content.fields);
    };

    if ($scope.content.fields.propositionReferenceeInterne && $scope.content.fields.propositionReferenceeInterne !=""){
        RubedoPagesService.getPageById($scope.content.fields.propositionReferenceeInterne).then(function(response){
                if (response.data.success){
                    $scope.content.contentLinkUrl = response.data.url;
                }
            });
    }
    else if ($scope.content.fields.propositionReferencee && $scope.content.fields.propositionReferencee !="") {
            $scope.content.contentLinkUrl = $scope.content.fields.propositionReferencee;
            $scope.content.isExternal=true;
    }
    else $scope.content.contentLinkUrl = $scope.content.detailPageUrl;
    
    $scope.content.type = {
        title:
        {
            cType:"textfield",
            config:{
                name:"text",
                fieldLabel:"Title",
                allowBlank:false
            }
        },
        summary:
        {
            cType:"textarea",
            config:{
                name:"summary",
                fieldLabel:"Summary",
                allowBlank:false
            }
        }
    };
    $scope.registerFieldEditChanges = me.registerEditChanges;

}]);

