angular.module("rubedoBlocks").lazy.controller("ContentListController",['$scope','$compile','RubedoContentsService',"$route","RubedoContentTypesService","RubedoPagesService","TaxonomyService","$location","$sce",
	function($scope,$compile,RubedoContentsService,$route,RubedoContentTypesService,RubedoPagesService,TaxonomyService,$location,$sce){

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
    me.ismagic = config.magicQuery ? config.magicQuery : false;
    var options = {
        start: me.start,
        limit: me.limit,
        ismagic: me.ismagic,
        'fields[]' : ["text","nom","prenom","summary","image","photoContact","propositionReferencee","propositionReferenceeInterne","subTitle"]

    };

    // construit la bonne url vers un template à partir du chemin local vers le template
    me.buildTemplateUrl = function(relative_path_template) {
        let themePath = "/theme/" + window.rubedoConfig.siteTheme +"/templates/blocks/";
        return themePath + relative_path_template;
    }

    // pour avoir l'image du drapeau d'un pays
    me.getFlagUrl = function(flagCode, size = 16){
        return `/assets/flags/${size}/${flagCode}.png`;
    };

    // navigue vers l'url
    me.goToPage = function(url) {
        if (url) window.location.href = url;
    }

    // ===================================================
    // GESTION DES TYPES DE CONTENUS et TEMPLATES
    // ===================================================

    const CONTENT_TYPES = {
        '56ab6e94c445ecde138b4e2b': {
            name: 'Lien vers page',
            path: 'contentList/LienVersPageTemplate.html'
        },
        '560d2bf445205e816041ea7f': {
            name: 'Contact',
            path: 'contentList/ContactTemplate.html'
        }
    }

    me.templateUrl = "NON_DEFINI";
    me.initTemplates = function() {
        me.currContentType = "56ab6e94c445ecde138b4e2b"; // = Lien vers page
        if (me.contents && me.contents.length > 0) me.currContentType = me.contents[0].typeId;
        if (CONTENT_TYPES[me.currContentType]) {
            me.templateUrl = me.buildTemplateUrl(CONTENT_TYPES[me.currContentType].path);
        } else {
            console.log("ERREUR : le type de contenu " + me.currContentType + " n'a pas de template HTML défini. Rendons gloire à Dieu en toutes circonstances !")
            me.templateUrl = "TYPE_DE_CONTENU_NON_PRIS_EN_CHARGE"
        }
    }
    // appelée après avoir fait un getcontent
    me.parseContents = function() {
        me.parseContacts()
    }

    // ===================================================
    //        PARSING SPECIFIQUE POUR les contacts
    // ===================================================

    me.parseContacts = function() {
        for (let i = 0; i < me.contents.length; i++) {
            if (me.contents[i].fields.summary) {
                let res = /@[A-Z]{2}/g.exec(me.contents[i].fields.summary)
                if (res && res.length) me.contents[i].flagCode = res[0].substring(1);
                me.contents[i].fields.summary = me.contents[i].fields.summary.replace(/@[A-Z]{2}/g, '').trim()
            }
        }
    }

    // ===================================================

    if(config.singlePage){
        options.detailPageId = config.singlePage;
    }
    if(config.enableFOContrib&&$scope.rubedo.current.user){
        //options.foContributeMode = true;   ENABLE to filter contents by user
        me.isFOContributeMode=true;
        if (config.editorPageId){
            RubedoPagesService.getPageById(config.editorPageId).then(function(response){
                if (response.data.success){
                    me.editorPageUrl=response.data.url;
                }
            });
        }
    }
    me.titleOnly = config.showOnlyTitle;
    me.columns = config.columns && !config.infiniteScroll ? 'col-md-'+(12/config.columns):'col-md-12';
    me.showPaginator = config.showPager && !config.infiniteScroll;
    me.changePageAction = function(){
        options.start = me.start;
        $location.search(blockPagingIdentifier,(me.start/me.limit)+1);
        me.getContents(config.query, pageId, siteId, options);
    };
    me.getVideoId = function(url){
        var string = url.split("/");
        var videoId = string[string.length-1];
        if (videoId.length>12) {
                        videoId=url.split("watch?v=")[1];
        }
        return $sce.trustAsResourceUrl("https://www.youtube.com/embed/"+videoId+"?showinfo=0");
    }

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
    
    me.getContents = function (queryId, pageId, siteId, options, add){
        RubedoContentsService.getContents(queryId,pageId,siteId, options).then(function(response){
            if (response.data.success){
                me.count = response.data.count;
                me.queryType=response.data.queryType;
                me.usedContentTypes=response.data.usedContentTypes;
                me.contents = response.data.contents;
                me.initTemplates()
                //console.log('debug getcontents : received ', response.data.contents, me.contents)
                me.parseContents()
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
                    $scope.content.contentLinkUrl = response.data.url;;
                }
            });
    }
    else if ($scope.content.fields.propositionReferencee && $scope.content.fields.propositionReferencee !="") {
            $scope.content.contentLinkUrl = $scope.content.fields.propositionReferencee;
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

