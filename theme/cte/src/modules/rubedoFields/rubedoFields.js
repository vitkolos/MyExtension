/**
 * Module that manages fields for display and edit
 */
(function(){
    var moduleDependencies=['rubedoDataAccess','xeditable','checklist-model','ckeditor','ui.bootstrap.datetimepicker'];
    if (typeof(google)!="undefined"){
        moduleDependencies.push('google-maps');
    }
    var module = angular.module('rubedoFields',moduleDependencies);

    module.run(function(editableOptions ) {
        editableOptions.theme = 'bs3';
    });

    module.config(function ($controllerProvider, $compileProvider, $filterProvider, $provide) {
        module.lazy = {
            controller: $controllerProvider.register,
            directive: $compileProvider.directive,
            filter: $filterProvider.register,
            factory: $provide.factory,
            service: $provide.service
        };
    });

    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    
    fieldsConfig={
        "textarea":"/templates/fields/textarea.html",
        "textareafield":"/templates/fields/textarea.html",
        "Ext.form.field.TextArea":"/templates/fields/textarea.html",
        "title":"/templates/fields/title.html",
        "datefield":"/templates/fields/date.html",
        "Ext.form.field.Date":"/templates/fields/date.html",
        "Ext.form.field.Time":"/templates/fields/time.html",
        "timefield":"/templates/fields/time.html",
        "Ext.form.field.Number":"/templates/fields/number.html",
        "numberfield":"/templates/fields/number.html",
        "slider":"/templates/fields/slider.html",
        "Ext.slider.Single":"/templates/fields/slider.html",
        "textfield":"/templates/fields/text.html",
        "Ext.form.field.Text":"/templates/fields/text.html",
        "CKEField":"/templates/fields/richText.html",
        "Rubedo.view.CKEField":"/templates/fields/richText.html",
        "externalMediaField":"/templates/fields/externalMedia.html",
        "Rubedo.view.externalMediaField":"/templates/fields/externalMedia.html",
        "radiogroup":"/templates/fields/radioGroup.html",
        "Ext.form.RadioGroup":"/templates/fields/radioGroup.html",
        "checkboxgroup":"/templates/fields/checkboxGroup.html",
        "Ext.form.CheckboxGroup":"/templates/fields/checkboxGroup.html",
        "combobox":"/templates/fields/combobox.html",
        "Ext.form.field.ComboBox":"/templates/fields/combobox.html",
        "localiserField":"/templates/fields/localiser.html",
        "Rubedo.view.localiserField":"/templates/fields/localiser.html",
        "treepicker":"/templates/fields/pageLink.html",
        "Ext.ux.TreePicker":"/templates/fields/pageLink.html",
        "checkboxfield":"/templates/fields/checkbox.html",
        "Ext.form.field.Checkbox":"/templates/fields/checkbox.html",
        "ImagePickerField":"/templates/fields/media.html",
        "Rubedo.view.ImagePickerField":"/templates/fields/media.html",
        "userPhoto":"/templates/fields/userPhoto.html",
        "DCEField":"/templates/fields/contentLink.html",
        "Rubedo.view.DCEField":"/templates/fields/contentLink.html",
        "ratingField":"/templates/fields/rating.html",
        "Rubedo.ux.widget.Rating":"/templates/fields/rating.html",
        "productBox":"/templates/fields/productBox.html",
        "embeddedImageField":"/templates/fields/embeddedImage.html",
        "Rubedo.view.embeddedImageField":"/templates/fields/embeddedImage.html",
        "RDirectObjectField":"/templates/fields/jsonObject.html",
        "Rubedo.view.RDirectObjectField":"/templates/fields/jsonObject.html",
        "fieldNotFound":"/templates/fields/fieldNotFound.html"
    };

    inputFieldsConfig={
        "userPhoto":"/templates/fields/userPhoto.html",
        "textfield":"/templates/inputFields/text.html",
        "Ext.form.field.Text":"/templates/inputFields/text.html",
        "Ext.form.field.Number":"/templates/inputFields/number.html",
        "numberfield":"/templates/inputFields/number.html",
        "textarea":"/templates/inputFields/textarea.html",
        "textareafield":"/templates/inputFields/textarea.html",
        "Ext.form.field.TextArea":"/templates/inputFields/textarea.html",
        "CKEField":"/templates/inputFields/richText.html",
        "Rubedo.view.CKEField":"/templates/inputFields/richText.html",
        "checkbox":"/templates/inputFields/checkbox.html",
        "Ext.form.field.Checkbox":"/templates/inputFields/checkbox.html",
        "combobox":"/templates/inputFields/combobox.html",
        "Ext.form.field.ComboBox":"/templates/inputFields/combobox.html",
        "radiogroup":"/templates/inputFields/radioGroup.html",
        "Ext.form.RadioGroup":"/templates/inputFields/radioGroup.html",
        "datefield":"/templates/inputFields/date.html",
        "Ext.form.field.Date":"/templates/inputFields/date.html",
        "localiserField":"/templates/inputFields/localiser.html",
        "Rubedo.view.localiserField":"/templates/inputFields/localiser.html",
        "ImagePickerField":"/templates/inputFields/media.html",
        "Rubedo.view.ImagePickerField":"/templates/inputFields/media.html",
        "externalMediaField":"/templates/inputFields/externalMedia.html",
        "Rubedo.view.externalMediaField":"/templates/inputFields/externalMedia.html",
        "ratingField":"/templates/inputFields/rating.html",
        "Rubedo.ux.widget.Rating":"/templates/inputFields/rating.html"
    };

    //service for resolving field templates
    module.factory('RubedoFieldTemplateResolver', function() {
        var serviceInstance={};
        serviceInstance.getTemplateByType=function(type){
            if (fieldsConfig[type]){
                return (themePath+fieldsConfig[type]);
            } else {
                return (themePath+fieldsConfig.fieldNotFound);
            }
        };
        serviceInstance.getInputTemplateByType=function(type){
            if (inputFieldsConfig[type]){
                return (themePath+inputFieldsConfig[type]);
            } else {
                return null;
            }
        };
        return serviceInstance;
    });

    //generic field directive
    module.directive("rubedoField",function(){
        return {
            restrict:"E",
            scope:true,
            templateUrl:themePath+"/templates/rubedoField.html",
            link: function ( scope, element, attrs ) {
                var el;
                attrs.$observe( 'field', function ( field ) {
                    if ( angular.isDefined( field ) && field ) {
                        scope.field=angular.fromJson(field);
                    }
                });
            }
        };
    });

    module.directive('rubedoPageLink',["RubedoPagesService",function (RubedoPagesService) {
            return {
                link: function (scope, element, attrs) {
                    RubedoPagesService.getPageById(attrs.rubedoPageLink).then(function(response){
                        if (response.data.success){
                            attrs.$set("href",response.data.url);
                        }
                    });


                }
            };
        }]);
    //field controllers

    CKEDITOR.on('instanceCreated', function(event) {
        if (event.editor.element.getAttribute("output-plain-text")){
            event.editor.getData=function(){return(event.editor.editable().getText());};
        }

    });
    module.controller("RTEFieldController",['$scope','$sce',function($scope,$sce){
        var me=this;
        var CKEMode=$scope.field.config.CKETBConfig;
        var myTBConfig=[
            { name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source', '-', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
            { name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo',"Source"  ] },
            { name: 'editing', groups: [ 'find', 'selection', 'spellchecker' ], items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },
            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat' ] },
            '/',
            { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
            { name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
            '/',
            { name: 'colors', items: [ 'TextColor', '-','BGColor' ] },
            { name: 'tools', items: [ 'Maximize', '-','ShowBlocks' ] },
            { name: 'links', items: [ 'Link', "Rubedolink", 'Unlink','-','Anchor' ] },
            { name: 'insert', items: [ 'Image',  '-', 'Table', 'HorizontalRule', 'SpecialChar', 'PageBreak' ] }
        ];
        if (CKEMode=="Standard"){
            myTBConfig=[
                { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat' ] },
                { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
                { name: 'colors', items: [ 'TextColor','BGColor','-', 'Scayt' ] },
                '/',
                { name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
                { name: 'insert', items: [ 'Image',  '-', 'Table', 'SpecialChar', 'PageBreak', 'Link', "Rubedolink", 'Unlink'] },
                { name: 'managing', items: [ 'Maximize','-','Undo', 'Redo', "Source"  ] }
            ];
        } else if (CKEMode=="Basic"){
            myTBConfig=[
            { name: 'clipboard', groups: [ 'undo' ], items: [ 'Undo', 'Redo' ] },
           { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic','-', 'RemoveFormat' ] },
            { name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: ['PasteText', '-', 'Undo', 'Redo',"Source"  ] },
           { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [  'Outdent', 'Indent', 'Blockquote']},
            { name: 'styles', items: [ 'Format' ] },
            { name: 'insert', items: [ 'Image', 'Youtube', '-', 'HorizontalRule'] },
            { name: 'links', items: [ 'Link', "Rubedolink", 'Unlink'] },
            { name: 'colors', items: [ 'Scayt'] }
            ];
        }
        var editorOptions={
            toolbar:  myTBConfig,
            allowedContent:true,
            language:$scope.fieldLanguage,
            entities:false,
            entities_latin:false,
            extraPlugins:'rubedolink,youtube',
            filebrowserImageBrowseUrl:"/backoffice/ext-finder?type=Image",
            filebrowserImageUploadUrl:null
        };
        if ($scope.field.cType!="CKEField"&&$scope.field.cType!="Rubedo.view.CKEField"){
            editorOptions.removePlugins= 'colorbutton,find,flash,font,' + 'forms,iframe,image,newpage,removeformat' + 'smiley,specialchar,stylescombo,templates,wsc';
            editorOptions.toolbar = [
                { name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', '-', 'Undo', 'Redo' ] }
            ];
            editorOptions.rubedoPlainTextMode=true;
        }
        $scope.editorOptions=editorOptions;
        me.isCKEReady=false;
        $scope.setCKEIsReady=function(){
            setTimeout(function(){me.isCKEReady=true;},200);

        };
        if (!$scope.fieldInputMode){
            $scope.$watch("fieldEntity."+$scope.field.config.name, function(newValue) {
                if(!$scope.fieldEditMode){
                    if (!newValue){
                        newValue="<div></div>";
                    }
                    var swt = newValue.substr(0, 1);
                    if (swt!="<"){
                        newValue="<div>"+newValue+"</div>";
                    }
                    me.html=jQuery.htmlClean(newValue, {
                        allowedAttributes:[["style"],["rubedo-page-link"],["target"]],
                        allowedTags: ['iframe','p','div','a','span','img','b','strong','em','h1','h2','h3','h4','h5','h6','ul','li','blockquote','br'],
                        removeTags:["basefont","center","dir","font","frame","frameset","isindex","menu","noframes","s","strike","u"],                        
                        replace: [[["b", "big"], "strong"]],
                        format: true
                    });

                } else if ($scope.fieldEditMode&&!me.html){
                    if (!newValue){
                        newValue="";
                    }
                    me.html=$sce.trustAsHtml(jQuery.htmlClean(newValue, {
                        allowedAttributes:[["style"],["rubedo-page-link"]],
                        allowedTags: ['iframe','p','div','a','span','img','b','strong','em','h1','h2','h3','h4','h5','h6','ul','li','blockquote','br'],
                        removeTags:["basefont","center","dir","font","frame","frameset","isindex","menu","noframes","s","strike","u"],                        
                        format: true
                    }));
                }
                if ($scope.fieldEditMode&&me.isCKEReady){
                    $scope.registerFieldEditChanges();
                }
            });
        }
    }]);

    module.controller("ExternalMediaFieldController",['$scope','$http','$sce',function($scope,$http,$sce){
        var me=this;
        me.refreshRender=function(){
            var myValue=$scope.fieldEntity[$scope.field.config.name];
            if ((myValue)&&(myValue.url)){
                var url = "http://iframe.ly/api/oembed?callback=JSON_CALLBACK&url="+encodeURIComponent(myValue.url);
                if ($scope.rubedo.current.site.iframelyKey){
                    url=url+"&api_key="+$scope.rubedo.current.site.iframelyKey;
                }
                $http.jsonp(url).success(function(response){
                    me.html=$sce.trustAsHtml(response.html);
                });
            }
        };
        me.refreshRender();
        me.handleSizeChanges=function(){
            if ($scope.fieldEditMode){
                $scope.registerFieldEditChanges();
            }
        };
        me.handleUrlChanges=function(){
            me.refreshRender();
            if ($scope.fieldEditMode){
                $scope.registerFieldEditChanges();
            }
        };
    }]);

    module.controller("RadioGroupController",['$scope',function($scope){
        var me=this;
        var items=$scope.field.config.items;
        var itemsObj={};
        angular.forEach(items,function(item){
            itemsObj[item.inputValue]=item.boxLabel;
        });
        me.options=itemsObj;
    }]);

    module.controller("RatingFieldController",['$scope',function($scope){
        var me=this;
        me.getStarArray=function(){
            var starArray=[];
            for (i = 1; i <= $scope.field.config.numberOfStars; i++) {
                if (i<=$scope.fieldEntity[$scope.field.config.name]){
                    starArray.push("glyphicon-star");
                } else {
                    starArray.push("glyphicon-star-empty");
                }
            }
            return (starArray);
        };
        me.editValue=function(index){
          if ($scope.fieldEditMode||$scope.fieldInputMode){
              $scope.fieldEntity[$scope.field.config.name]=index;
              if ($scope.fieldEditMode){
                  $scope.registerFieldEditChanges();
              }
          }
        };
    }]);

    module.controller("CheckboxGroupController",['$scope',function($scope){
        var me=this;
        var items=$scope.field.config.items;
        var itemsObj={};
        if (!angular.isArray($scope.fieldEntity[$scope.field.config.name][$scope.field.config.name])){
            $scope.fieldEntity[$scope.field.config.name][$scope.field.config.name]=[$scope.fieldEntity[$scope.field.config.name][$scope.field.config.name]];
            $scope.$watch('fieldEntity.'+$scope.field.config.name+'.'+$scope.field.config.name,function(changedValue){
                if (!angular.isArray($scope.fieldEntity[$scope.field.config.name][$scope.field.config.name])){
                    $scope.fieldEntity[$scope.field.config.name][$scope.field.config.name]=[$scope.fieldEntity[$scope.field.config.name][$scope.field.config.name]];
                }
            });
        }
        angular.forEach(items,function(item){
            itemsObj[item.inputValue]=item.boxLabel;
        });
        me.displayValue=function(value){
          var result=[];
          angular.forEach(value,function(item){
              result.push(itemsObj[item]);
          });
         return result.join(", ");
        };
    }]);

    module.controller("ComboboxController",['$scope',function($scope){
        var me=this;
        if (!$scope.field.store){
            $scope.field.store=$scope.field.config.store;
        }
        var items=$scope.field.store.data;
        var itemsObj={};
        if (!angular.isArray($scope.fieldEntity[$scope.field.config.name])&&$scope.field.config.multiSelect){
            $scope.fieldEntity[$scope.field.config.name]=[$scope.fieldEntity[$scope.field.config.name]];
            $scope.$watch('fieldEntity.'+$scope.field.config.name,function(changedValue){
                if (!angular.isArray($scope.fieldEntity[$scope.field.config.name])){
                    $scope.fieldEntity[$scope.field.config.name]=[$scope.fieldEntity[$scope.field.config.name]];
                }
            });
        }
        angular.forEach(items,function(item){
            itemsObj[item.valeur]=item.nom;
        });
        me.displayValue=function(value){
            if ($scope.field.config.multiSelect){
                var result=[];
                angular.forEach(value,function(item){
                    result.push(itemsObj[item]);
                });
                return result.join(", ");
            } else {
                return itemsObj[value];
            }
        };
    }]);

    module.controller("LocaliserFieldController",["$scope",function($scope){
        var me=this;
        me.map={
            center:{
                latitude:48.8567,
                longitude:2.3508
            },
            zoom:4
        };
        $scope.$watch("fieldEntity."+$scope.field.config.name, function(newValue){
            if (newValue&&newValue.lat&&newValue.lon){
                me.map.center={
                    latitude:newValue.lat,
                    longitude:newValue.lon
                };
                me.map.zoom=14;
                me.positionMarker={
                    coords:{
                        latitude:newValue.lat,
                        longitude:newValue.lon
                    }
                };
                if (newValue.address){
                    me.positionMarker.label=newValue.address;
                    if ((!$scope.feildEditMode&&!$scope.fieldInputMode)||!me.editableAddress){
                        me.editableAddress=angular.copy(newValue.address);
                    }
                }
            } else {
                me.positionMarker=null;
            }
        });
        me.geocoder = new google.maps.Geocoder();
        me.reGeocode=function(){
          if (me.editableAddress&&me.editableAddress!=""){
              var value=angular.copy($scope.fieldEntity[$scope.field.config.name]);
              if (!value){
                  value={
                      address:null,
                      altitude:null,
                      lat:null,
                      lon:null,
                      location:{
                          type:"Point",
                          coordinates:[]
                      }
                      };
              }

              me.geocoder.geocode({
                  'address' : me.editableAddress
              }, function(results, status) {
                  if (status == google.maps.GeocoderStatus.OK) {
                      var latitude=results[0].geometry.location.lat();
                      var longitude=results[0].geometry.location.lng();
                      value.address=angular.copy(me.editableAddress);
                      value.lat=latitude;
                      value.lon=longitude;
                      value.location.coordinates=[longitude,latitude];
                      $scope.fieldEntity[$scope.field.config.name]=angular.copy(value);
                      if ($scope.registerFieldEditChanges){
                        $scope.registerFieldEditChanges();
                      }
                      $scope.$apply();
                  }
              });
          }
        };
        me.mapTimer=null;
        me.handleAddressEdit=function(){
            if ($scope.fieldEditMode||$scope.fieldInputMode){
                clearTimeout(me.mapTimer);
                me.mapTimer = setTimeout(function() {
                    me.reGeocode();
                }, 500);
            }
        };
    }]);

    module.controller("PageLinkController",["$scope","RubedoPagesService",function($scope,RubedoPagesService){
        var me=this;
        var pageId=$scope.fieldEntity[$scope.field.config.name];
        me.displayLink=function(pageId){
            RubedoPagesService.getPageById(pageId).then(
                function(response){
                    if (response.data.success){
                        me.pageUrl=response.data.url;
                        me.pageTitle=response.data.title;
                    }
                }
            );
        };
        if (pageId&&pageId!=""){
            me.displayLink(pageId);
        }
        me.launchEditor=function(){
            if ($scope.fieldEditMode){
                var width = screen.width/2;
                var height = screen.height/2;
                var left = (screen.width-width)/2;
                var top = +((screen.height-height)/2);
                window.saveRubedPageLinkChange=function(id){
                    $scope.fieldEntity[$scope.field.config.name]=id;
                    pageId=id;
                    $scope.registerFieldEditChanges();
                    me.displayLink(pageId);
                    window.saveRubedPageLinkChange=function(){};
                };
                var popupUrl="/backoffice/link-finder?soloMode=true";
                window.open(
                    popupUrl,
                    "Page link",
                    "menubar=no, status=no, scrollbars=no, top="+top+", left="+left+", width="+300+", height="+360+""
                );

            }
        }
    }]);

    module.controller("ContentLinkController",["$scope","RubedoContentsService",function($scope,RubedoContentsService){
        var me=this;
        var options = {
            siteId: $scope.rubedo.current.site.id,
            pageId: $scope.rubedo.current.page.id
        };
        var contentId=$scope.fieldEntity[$scope.field.config.name];
        if (contentId&&contentId!=""){
            RubedoContentsService.getContentById(contentId, options).then(
                function(response){
                    if (response.data.success){
                        me.contentUrl=response.data.content.canonicalUrl;
                        me.contentTitle=response.data.content.fields.text;
                    }
                }
            );
        }
        me.launchEditor=function(){
            if ($scope.fieldEditMode){
                var width = screen.width/2;
                var height = screen.height/2;
                var left = (screen.width-width)/2;
                var top = +((screen.height-height)/2);
                window.saveRubedoMediaChange=function(id){
                    $scope.fieldEntity[$scope.field.config.name]=id;
                    contentId=id;
                    $scope.registerFieldEditChanges();
                    RubedoContentsService.getContentById(contentId, options).then(
                        function(response){
                            if (response.data.success){
                                me.contentUrl=response.data.content.canonicalUrl;
                                me.contentTitle=response.data.content.fields.text;
                            }
                        }
                    );
                    window.saveRubedoMediaChange=function(){};
                };
                var popupUrl="/backoffice/ext-finder?soloMode=true&contentMode=true";
                if ($scope.field.config.allowedCT){
                    popupUrl=popupUrl+"&allowedCT="+$scope.field.config.allowedCT+"";
                }
                window.open(
                    popupUrl,
                    "Content link",
                    "menubar=no, status=no, scrollbars=no, top="+top+", left="+left+", width="+width+", height="+height+""
                );
            }
        };
    }]);

    module.controller("MediaFieldController",["$scope","RubedoMediaService","$element",function($scope,RubedoMediaService,$element){
        var me=this;
        var mediaId=$scope.fieldEntity[$scope.field.config.name];
        me.launchEditor=function(){
            if ($scope.fieldEditMode){
                var width = screen.width/2;
                var height = screen.height/2;
                var left = (screen.width-width)/2;
                var top = +((screen.height-height)/2);
                window.saveRubedoMediaChange=function(id){
                    $scope.fieldEntity[$scope.field.config.name]=id;
                    mediaId=id;
                    $scope.registerFieldEditChanges();
                    RubedoMediaService.getMediaById(mediaId).then(
                        function(response){
                            if (response.data.success){
                                me.media=response.data.media;
                                me.displayMedia();
                            }
                        }
                    );
                    window.saveRubedoMediaChange=function(){};
                };
                var popupUrl="/backoffice/ext-finder?soloMode=true";
                if ($scope.field.config.allowedDAMTypes){
                    popupUrl=popupUrl+"&allowedDT="+$scope.field.config.allowedDAMTypes+"";
                }
                window.open(
                    popupUrl,
                    "DAM",
                    "menubar=no, status=no, scrollbars=no, top="+top+", left="+left+", width="+width+", height="+height+""
                );
            }
        };
        me.displayMedia=function(){
            if (me.media&&me.media.originalFileId){
                switch(me.media.mainFileType) {
                    case "Image":
                        me.fileTypeTemplate=themePath+"/templates/fields/media/image.html";
                        break;
                    case "Document":
                        me.fileTypeTemplate=themePath+"/templates/fields/media/document.html";
                        break;
                    case "Audio":
                        me.jwSettings={
                            primary:"flash",
                            height:40,
                            width:"100%",
                            file:me.media.url
                        };
                        me.fileTypeTemplate=themePath+"/templates/fields/media/audio.html";
                        setTimeout(function(){jwplayer("audio"+me.media.originalFileId).setup(me.jwSettings);}, 200);
                        break;
                    case "video":
                    case "Video":
                        me.jwSettings={
                            file:me.media.url
                        };
                        me.fileTypeTemplate=themePath+"/templates/fields/media/video.html";
                        setTimeout(function(){jwplayer("video"+me.media.originalFileId).setup(me.jwSettings);}, 200);
                        break;
                    default:
                        me.fileTypeTemplate=themePath+"/templates/fields/media/fieldNotFound.html";
                }
            }
        };
        if (mediaId){
            RubedoMediaService.getMediaById(mediaId).then(
                function(response){
                    if (response.data.success){
                        me.media=response.data.media;
                        me.displayMedia();
                    }
                }
            );
        }
        me.newFile=null;
        me.uploadNewFile=function(){
           me.notification=null;
           if ($scope.fieldInputMode&&me.newFile&&$scope.field.config.allowedDAMTypes){
               var uploadOptions={
                   typeId:$scope.field.config.allowedDAMTypes,
                   fields:{
                       title:me.newFile.name
                   }
               };
               RubedoMediaService.uploadMedia(me.newFile,uploadOptions).then(
                   function(response){
                       if (response.data.success){
                           var id=response.data.media.id;
                           $scope.fieldEntity[$scope.field.config.name]=id;
                           mediaId=id;
                           if ($scope.registerFieldEditChanges){
                               $scope.registerFieldEditChanges();
                           }
                            me.media=response.data.media;
                            me.displayMedia();
                       } else {
                           console.log(response);
                           me.notification={
                               type:"error",
                               text:response.data.message
                           };
                       }
                   },
                   function(response){
                       console.log(response);
                       me.notification={
                           type:"error",
                           text:response.data.message
                       };
                   }
               );
           }

        };
        if ($scope.fieldInputMode){
            $element.find('.form-control').on('change', function(){
                setTimeout(function(){
                    me.uploadNewFile();
                }, 200);
            });
        }
    }]);

    module.directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function(){
                    scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);

    module.controller("UserPhotoFieldController",["$scope","RubedoUsersService",function($scope,RubedoUsersService){
        var me=this;
        me.submitPhoto=function(){
            if (me.photoFile){
                RubedoUsersService.changeUserPhoto($scope.rubedo.current.user.id, me.photoFile).then(
                    function(response){
                        if (response.data.success){
                            $scope.userPhotoUrl=response.data.photoUrl;
                            $scope.updatePhotoUrl(response.data.photoUrl);
                            $scope.registerFieldEditChanges();
                        } else {
                            console.log(response);
                        }
                    },
                    function(response){
                        console.log(response);
                    }
                );
            }

        }

    }]);

    module.controller("ProductBoxController",['$scope','RubedoShoppingCartService','$rootScope',function($scope,RubedoShoppingCartService,$rootScope){
        var me=this;
        me.productProperties=$scope.productProperties;
        me.manageStock=$scope.manageStock;
        me.productId=$scope.productId;
        me.excludedVariationFields=["id","price","sku","stock","specialOffers"];
        me.variationFields=[];
        me.selectionValues={};
        me.possibleSelectValues={};
        angular.forEach(me.productProperties.variations[0],function(value,key){
            if (me.excludedVariationFields.indexOf(key)==-1){
                me.variationFields.push(key);
            }
        });
        angular.forEach(me.variationFields,function(varField){
            me.selectionValues[varField]=me.productProperties.variations[0][varField];
        });
        me.applySelectorConstraints=function(){
            angular.forEach(me.variationFields,function(varField,index){
                me.possibleSelectValues[varField]=[];
                angular.forEach(me.productProperties.variations,function(variation){
                    if (me.possibleSelectValues[varField].indexOf(variation[varField])==-1){
                        if (index==0){
                            me.possibleSelectValues[varField].push(variation[varField]);
                        } else {
                            var variationOk=true;
                            angular.forEach(me.variationFields,function(otherField,otherFieldIndex){
                                if (otherFieldIndex<index&&variationOk){
                                    if (variation[otherField]!=me.selectionValues[otherField]){
                                        variationOk=false;
                                    }
                                }
                            });
                            if (variationOk){
                                me.possibleSelectValues[varField].push(variation[varField]);
                            }
                        }
                    }
                });
                if (me.possibleSelectValues[varField].indexOf(me.selectionValues[varField])==-1){
                    me.selectionValues[varField]=me.possibleSelectValues[varField][0];
                }
            });
        };
        me.applySelectorConstraints();
        me.setCurrentVariation=function(variation){
            me.currentVariation=variation;
            me.currentPrice=variation.price;
            me.oldPrice=variation.price;
            me.hasSpecialOffer=false;
            var now=new Date();
            angular.forEach(variation.specialOffers,function(offer){
                if (!me.hasSpecialOffer&&(now<=new Date(offer.endDate*1000))&&(now>=new Date(offer.beginDate*1000))){
                    me.hasSpecialOffer=true;
                    me.currentPrice=offer.price;
                }
            });
        };
        me.handleFieldChange=function(){
            me.applySelectorConstraints();
            var foundVariation=false;
            angular.forEach(me.productProperties.variations,function(variation){
                if (!foundVariation){
                    var variationOk=true;
                    angular.forEach(me.variationFields,function(otherField){
                        if (variationOk){
                            if (variation[otherField]!=me.selectionValues[otherField]){
                                variationOk=false;
                            }
                        }
                    });
                    if (variationOk){
                        foundVariation=variation;
                    }
                }
            });
            if (foundVariation){
                me.setCurrentVariation(foundVariation);
            }
        };
        me.setCurrentVariation(me.productProperties.variations[0]);
        me.canOrder=function(){
            return !(me.manageStock&&(me.productProperties.canOrderNotInStock=="false")&&(me.currentVariation.stock < me.productProperties.outOfStockLimit)) ;
        };
        me.getProductAvailabilityText=function(){
            if (!me.manageStock){
                return "";
            }
            var complement;
            if (me.currentVariation.stock < me.productProperties.outOfStockLimit){
                complement=me.productProperties.resupplyDelay > 1 ? " days" : " day";
                return("Out of stock : ressuplied before "+me.productProperties.resupplyDelay+ complement);

            } else {
                complement=me.productProperties.preparationDelay > 1 ? " days" : " day";
                return("In stock : sent before "+me.productProperties.preparationDelay + complement);
            }
        };
        me.addToCart=function(){
            var options={
                productId:me.productId,
                variationId:me.currentVariation.id,
                amount:1
            };
            RubedoShoppingCartService.addToCart(options).then(
                function(response){
                    $rootScope.$broadcast("shoppingCartUpdated",{emitter:"productBox"});
                }
            );
        };
    }]);

    module.controller("DateFieldController",["$scope","$element","$filter",function($scope,$element,$filter){
        var me=this;
        var originalDate=$scope.fieldEntity[$scope.field.config.name];
        if (originalDate){
            me.date=new Date($scope.fieldEntity[$scope.field.config.name]*1000);
            me.formattedDate=$filter('date')(me.date, "shortDate");
        } else {
            me.date=new Date();
        }
        me.setTime=function(newDate){
            $scope.fieldEntity[$scope.field.config.name]=newDate.getTime()/1000;
            me.formattedDate=$filter('date')(newDate, "shortDate");
            if ($scope.registerFieldEditChanges){
                $scope.registerFieldEditChanges();
            }

        };

    }]);



})();