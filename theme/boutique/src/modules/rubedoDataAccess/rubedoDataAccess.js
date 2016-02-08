/**
 * Module providing data access services
 */
(function(){
    var module = angular.module('rubedoDataAccess', ['ipCookie']);

    //global config
    var config = {
        baseUrl:'/api/v1',
        fingerPrintData:{}
    };


    var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

//add params to all requests
    module.config(function($httpProvider,$controllerProvider, $compileProvider, $filterProvider, $provide ){
        module.lazy = {
            controller: $controllerProvider.register,
            directive: $compileProvider.directive,
            filter: $filterProvider.register,
            factory: $provide.factory,
            service: $provide.service
        };
        $httpProvider.interceptors.push(function(){
            return {
                'request':function(
                    outboundConfig){
                    if (!outboundConfig.params){
                        outboundConfig.params={};
                    }
                    if (config.accessToken){
                        outboundConfig.params.access_token=config.accessToken;
                    }
                    if (config.lang){
                        outboundConfig.params.lang =  config.lang;
                    }
                    return outboundConfig;

                }
            };
        });
    });

    //auxiliary functions
    auxObjectToQueryString=function(obj){
        var queryString=[];
        for (var prop in obj){
            if ((obj.hasOwnProperty(prop))&&(obj[prop])&&(obj[prop]!="")){
                queryString.push(encodeURIComponent(prop)+"="+encodeURIComponent(obj[prop]));
            }
        }
        return (queryString.join("&"));
    };

    module.factory('RubedoModuleConfigService',[function(){
        var serviceInstance = {};
        serviceInstance.addFallbackLang=function(fallbackLang){
            config.lang=config.lang+'|'+fallbackLang;
        };
        serviceInstance.changeLang =  function(lang){
            config.lang = lang;
        };
        serviceInstance.getConfig=function(){
            return config;
        };
        return serviceInstance;
    }]);

    //service providing page json from current route
    module.factory('RubedoPagesService', ['$location','$route','$http',function($location,$route,$http) {
        var serviceInstance={};
        serviceInstance.getPageByCurrentRoute=function(){
            config.lang = $route.current.params.lang;
            return ($http.get(config.baseUrl+"/pages",{
                params:{
                    site:$location.host(),
                    route:$route.current.params.routeline
                }
            }));
        };
        serviceInstance.getPageById=function(pageId){
            return ($http.get(config.baseUrl+"/pages/"+pageId));
        };
        return serviceInstance;
    }]);

    //service providing menu structure using root page id, level and language
    module.factory('RubedoMenuService', ['$route','$http',function($route,$http) {
        var serviceInstance={};
        serviceInstance.getMenu=function(pageId,menuLevel,includeRichText){
            var params={
                pageId:pageId,
                menuLocale:$route.current.params.lang,
                menuLevel:menuLevel
            };
            if (includeRichText){
                params.includeRichText=true;
            }
            return ($http.get(config.baseUrl+"/menu",{
                params:params
            }));
        };
        return serviceInstance;
    }]);

    //service providing image urls
    module.factory('RubedoImageUrlService', function() {
        var serviceInstance={};
        serviceInstance.getUrlByMediaId=function(mediaId,options){
            var url="/dam?media-id="+mediaId+"&";
            if (options){
                url=url+auxObjectToQueryString(options);
            }
            return(url);
        };

        serviceInstance.getThumbnailUrlByMediaId = function(mediaId){
            var url="/dam/get-thumbnail?media-id="+mediaId;
            return(url);
        };
        return serviceInstance;
    });



    //service providing access to contents
    module.factory('RubedoContentsService', ['$route','$http','$location', function($route,$http,$location){
        var serviceInstance={};
        serviceInstance.getContents=function(queryId,pageId,siteId,options){
            var params = {
                queryId: queryId,
                pageId: pageId,
                siteId: siteId
            };
            if (options){
                angular.extend(params,options);
            }
            var getParams=$location.search();
            if (getParams.preview){
                if (getParams.preview_draft&&getParams.preview_draft=="true"){
                    params.useDraftMode=true;
                }
                if (getParams.preview_date&&getParams.preview_date!=""){
                    params.simulatedTime=getParams.preview_date;
                }
            }
            if (params.ismagic&&config.fingerprint){
                params.fingerprint =  config.fingerprint;
            }
            return ($http.get(config.baseUrl+"/contents", {
                params: params
            }));
        };
        serviceInstance.getContentById = function(contentId, options){
            if (!options){
                options={ };
            }
            if (config.fingerprint){
                options.fingerprint =  config.fingerprint;
            }
            return ($http.get(config.baseUrl+"/contents/"+contentId, {
                params: options
            }));
        };
        serviceInstance.updateContent=function(content){
            return ($http({
                url:config.baseUrl+"/contents/"+content.id,
                method:"PATCH",
                data : {
                    content:content
                }
            }));
        };
        serviceInstance.updateContents=function(contents){
            return ($http({
                url:config.baseUrl+"/contents",
                method:"PATCH",
                data:{
                    contents:contents
                }
            }));
        };
        serviceInstance.createNewContent=function(content){
            return ($http({
                url:config.baseUrl+"/contents",
                method:"POST",
                data:{
                    content:content
                }
            }));
        };
        return serviceInstance;
    }]);

    module.factory('RubedoProductsService', ['$route','$http','$location', function($route,$http,$location){
        var serviceInstance={};
        serviceInstance.getContents=function(queryId,pageId,siteId,options){
            var params = {
                queryId: queryId,
                pageId: pageId,
                siteId: siteId
            };
            if (options){
                angular.extend(params,options);
            }
            var getParams=$location.search();
            if (getParams.preview){
                if (getParams.preview_draft&&getParams.preview_draft=="true"){
                    params.useDraftMode=true;
                }
                if (getParams.preview_date&&getParams.preview_date!=""){
                    params.simulatedTime=getParams.preview_date;
                }
            }
            if (params.ismagic&&config.fingerprint){
                params.fingerprint =  config.fingerprint;
            }
            return ($http.get(config.baseUrl+"/ecommerce/products", {
                params: params
            }));
        };
        serviceInstance.getContentById = function(contentId, options){
            if (!options){
                options={ };
            }
            if (config.fingerprint){
                options.fingerprint =  config.fingerprint;
            }
            return ($http.get(config.baseUrl+"/ecommerce/products/"+contentId, {
                params: options
            }));
        };
        serviceInstance.updateContent=function(content){
            return ($http({
                url:config.baseUrl+"/ecommerce/products/"+content.id,
                method:"PATCH",
                data : {
                    content:content
                }
            }));
        };
        serviceInstance.updateContents=function(contents){
            return ($http({
                url:config.baseUrl+"/ecommerce/products",
                method:"PATCH",
                data:{
                    contents:contents
                }
            }));
        };
        return serviceInstance;
    }]);

    // authentication service
    module.factory('RubedoAuthService',['$http','ipCookie',function($http,ipCookie){
        var serviceInstance={};
        serviceInstance.persistTokens=function(accessToken,refreshToken,lifetime,remeberMe){
            if (!lifetime){
                lifetime=3600;
            }
            ipCookie("accessToken",accessToken,{path:"/", expires:lifetime, expirationUnit:"seconds"});
            if (remeberMe){
                ipCookie("refreshToken",refreshToken,{path:"/",expires:8760, expirationUnit:"hours"});
                ipCookie("rememberMe","true",{path:"/",expires:8760, expirationUnit:"hours"});
            } else {
                ipCookie("refreshToken",refreshToken,{path:"/"});
            }
            config.accessToken=accessToken;
        };
        serviceInstance.clearPersistedTokens=function(){
            ipCookie.remove('accessToken',{path:"/"});
            ipCookie.remove('refreshToken',{path:"/"});
            ipCookie.remove('rememberMe',{path:"/"});
            delete(config.accessToken);
        };
        serviceInstance.getPersistedTokens=function(){
            return {
                accessToken:ipCookie('accessToken'),
                refreshToken:ipCookie('refreshToken'),
                rememberMe:ipCookie('rememberMe')
            };
        };
        serviceInstance.generateToken=function(credentials,remeberMe){
            return ($http({
                url:config.baseUrl+"/auth/oauth2/generate",
                method:"POST",
                headers :{
                    "Authorization":"Basic "+Base64.encode(credentials.login+":" +credentials.password)
                },
                transformResponse:function(data,headerGetter){
                    var dataObj=angular.fromJson(data);
                    if (dataObj.success){
                        serviceInstance.persistTokens(dataObj.token.access_token,dataObj.token.refresh_token, dataObj.token.lifetime,remeberMe);
                    }
                    return(dataObj);
                }
            }));
        };
        serviceInstance.refreshToken=function(){
            return ($http({
                url:config.baseUrl+"/auth/oauth2/refresh",
                method:"POST",
                params:{
                    "refresh_token":serviceInstance.getPersistedTokens().refreshToken
                },
                transformResponse:function(data,headerGetter){
                    var dataObj=angular.fromJson(data);
                    if (dataObj.success){
                        var rememberMe=serviceInstance.getPersistedTokens().rememberMe;
                        serviceInstance.persistTokens(dataObj.token.access_token,dataObj.token.refresh_token, dataObj.token.lifetime,rememberMe);
                    } else {
                        serviceInstance.clearPersistedTokens();
                    }
                    return(dataObj);
                }
            }));
        };
        serviceInstance.recoverPassword = function(options){
            return ($http.get(config.baseUrl+"/users/password/token", {
                params: options
            }));
        };
        serviceInstance.getAuthStatus = function(){
            if (serviceInstance.getPersistedTokens().accessToken){
                config.accessToken=serviceInstance.getPersistedTokens().accessToken;
            }
            return ($http.get(config.baseUrl+"/auth"));
        };
        serviceInstance.changePassword =  function(options){
            return ($http({
                url:config.baseUrl+"/users/password/token",
                method:"POST",
                params:options
            }));
        };
        return serviceInstance;
    }]);

    //service providing research using ElasticSearch
    module.factory('RubedoSearchService',['$http',function($http){
        var serviceInstance = {};

        //Global Search
        serviceInstance.searchByQuery = function(options){
            return ($http.get(config.baseUrl+"/search", {
                params: options
            }));
        };
        //Media Search
        serviceInstance.getMediaById = function(options){
            return ($http.get(config.baseUrl+"/media/search", {
                params: options
            }));
        };
        //Users Search
        serviceInstance.searchUsers = function(options){
            return ($http.get(config.baseUrl+"/users/search",{
                params: options
            }));
        };
        //Geo Search
        serviceInstance.searchGeo = function(options){
            return ($http.get(config.baseUrl+"/geo/search",{
                params: options
            }));
        };
        //Products Search
        serviceInstance.searchProducts = function(options){
            return ($http.get(config.baseUrl+"/ecommerce/products/search",{
                params: options
            }));
        };
        return serviceInstance;
    }]);

    //service providing users access
    module.factory('RubedoUsersService', ['$http',function($http) {
        var serviceInstance={};
        serviceInstance.getUserById=function(userId){
            return ($http.get(config.baseUrl+"/users/"+userId));
        };
        serviceInstance.updateUser=function(user){
            return ($http({
                url:config.baseUrl+"/users/"+user.id,
                method:"PATCH",
                data : {
                    user:user
                }
            }));
        };
        serviceInstance.createUser=function(fields,userType){
            return ($http({
                url:config.baseUrl+"/users",
                method:"POST",
                data : {
                    fields:fields,
                    usertype:userType,
                    currentUrl:window.location.href
                }
            }));
        };
        serviceInstance.confirmUserEmail=function(userId,signupTime){
            return ($http({
                url:config.baseUrl+"/users/confirmemail",
                method:"POST",
                data : {
                    userId:userId,
                    signupTime:signupTime
                }
            }));
        };
        serviceInstance.changeUserPhoto=function(userId,file){
            var fd = new FormData();
            fd.append('file', file);
            fd.append('userId', userId);
            return($http.post(config.baseUrl+"/users/changephoto", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }));
        };
        return serviceInstance;
    }]);

    module.factory('RubedoMediaService', ['$http',function($http) {
        var serviceInstance={};
        serviceInstance.getMediaById=function(mediaId, options){
            return ($http.get(config.baseUrl+"/media/"+mediaId, {
                params: options
            }));
        };
        serviceInstance.getMediaByQuery=function(options){
            return ($http.get(config.baseUrl+"/media", {
                params: options
            }));
        };
        serviceInstance.getProtectedMediaById = function(options){
            return ($http.get(config.baseUrl+"/media/protected", {
                params: options
            }));
        };
        serviceInstance.postProtectedMediaById = function(options){
            return ($http({
                url:config.baseUrl+"/media/protected",
                method:"POST",
                data : options
            }));
        };
        serviceInstance.uploadMedia=function(file,options){
            var fd = new FormData();
            fd.append('file', file);
            return($http.post(config.baseUrl+"/media", fd, {
                transformRequest: angular.identity,
                params:options,
                headers: {'Content-Type': undefined}
            }));
        };
        return serviceInstance;
    }]);

    module.factory('RubedoUserTypesService', ['$http',function($http) {
        var serviceInstance={};
        serviceInstance.getUserTypeById=function(userTypeId){
            return ($http.get(config.baseUrl+"/usertypes/"+userTypeId));
        };
        return serviceInstance;
    }]);

    module.factory('RubedoContentTypesService', ['$http',function($http) {
        var serviceInstance={};
        serviceInstance.getContentTypes=function(){
            return ($http.get(config.baseUrl+"/contenttypes"));
        };
        serviceInstance.findById=function(id,options){
            return ($http.get(config.baseUrl+"/contenttypes/"+id,{
                params:options
            }));
        };
        return serviceInstance;
    }]);

    module.factory('RubedoTranslationsService', ['$http',function($http) {
        var serviceInstance={};
        serviceInstance.getTranslations=function(){
            return ($http.get(config.baseUrl+"/translations",{
                params:{
                    lang:window.location.pathname.split("/")[1]
                }
            }));
        };
        return serviceInstance;
    }]);

    module.factory('RubedoCountriesService', ['$http',function($http) {
        var serviceInstance={};
        serviceInstance.getCountries=function(){
            return ($http.get(config.baseUrl+"/ecommerce/countries"));
        };
        return serviceInstance;
    }]);

    module.factory('RubedoContactService', ['$http',function($http) {
        var serviceInstance={};
        serviceInstance.sendContact=function(payload){
            return ($http({
                url:config.baseUrl+"/contact",
                method:"POST",
                data : payload
            }));
        };
        return serviceInstance;
    }]);

    module.factory('RubedoMailingListService',['$http',function($http){
        var serviceInstance = {};
        serviceInstance.getAllMailingList = function(){
            return ($http.get(config.baseUrl+"/mailinglists",{
            }));
        };
        serviceInstance.subscribeToMailingLists=function(options){
            return ($http({
                url:config.baseUrl+"/mailinglists/subscribe",
                method:"POST",
                data : options
            }));
        };
        serviceInstance.unsubscribeToMailingLists = function(options){
            return ($http.delete(config.baseUrl+"/mailinglists/subscribe",{
                params: options
            }));
        };
        return serviceInstance;
    }]);

    module.factory('RubedoShoppingCartService',['$http','ipCookie',function($http,ipCookie){
        var serviceInstance = {};
        serviceInstance.getCart=function(options){
            if (ipCookie("shoppingCartToken")){
                options.shoppingCartToken=ipCookie("shoppingCartToken");
            }
            return ($http.get(config.baseUrl+"/ecommerce/shoppingcart", {
                params: options
            }));
        };
        serviceInstance.addToCart=function(options){
            if (ipCookie("shoppingCartToken")){
                options.shoppingCartToken=ipCookie("shoppingCartToken");
            }
            return ($http({
                url:config.baseUrl+"/ecommerce/shoppingcart",
                method:"POST",
                data : options,
                transformResponse:function(data,headerGetter){
                    var dataObj=angular.fromJson(data);
                    if (dataObj.success&&dataObj.shoppingCart&&dataObj.shoppingCart.id){
                        ipCookie("shoppingCartToken",dataObj.shoppingCart.id,{path:"/",expires:8760, expirationUnit:"hours"});
                    }
                    return(dataObj);
                }
            }));
        };
        serviceInstance.removeFromCart=function(options){
            if (ipCookie("shoppingCartToken")){
                options.shoppingCartToken=ipCookie("shoppingCartToken");
            }
            return ($http({
                url:config.baseUrl+"/ecommerce/shoppingcart",
                method:"DELETE",
                data : options,
                transformResponse:function(data,headerGetter){
                    var dataObj=angular.fromJson(data);
                    if (dataObj.success&&dataObj.shoppingCart&&dataObj.shoppingCart.id){
                        ipCookie("shoppingCartToken",dataObj.shoppingCart.id,{path:"/",expires:8760, expirationUnit:"hours"});
                    }
                    return(dataObj);
                }
            }));
        };
        return serviceInstance;
    }]);

    module.factory('RubedoShippersService',['$http','ipCookie',function($http,ipCookie){
        var serviceInstance = {};
        serviceInstance.getShippers=function(){
            var options={};
            if (ipCookie("shoppingCartToken")){
                options.shoppingCartToken=ipCookie("shoppingCartToken");
            }
            return ($http.get(config.baseUrl+"/ecommerce/shippers", {
                params: options
            }));
        };
        return serviceInstance;
    }]);

    module.factory('RubedoPaymentMeansService',['$http',function($http){
        var serviceInstance = {};
        serviceInstance.getActivePaymentMeans=function(){
            return ($http.get(config.baseUrl+"/ecommerce/paymentmeans"));
        };
        return serviceInstance;
    }]);

    module.factory('RubedoOrdersService',['$http','ipCookie',function($http,ipCookie){
        var serviceInstance = {};
        serviceInstance.getMyOrders=function(options){
            return ($http.get(config.baseUrl+"/ecommerce/orders",{
                params:options
            }));
        };
        serviceInstance.getOrderDetail=function(id){
            return ($http.get(config.baseUrl+"/ecommerce/orders/"+id));
        };
        serviceInstance.createOrder=function(options){
            if (ipCookie("shoppingCartToken")){
                options.shoppingCartToken=ipCookie("shoppingCartToken");
            }
            return ($http({
                url:config.baseUrl+"/ecommerce/orders",
                method:"POST",
                data : options
            }));
        };
        return serviceInstance;
    }]);

    module.factory('RubedoPaymentService',['$http',function($http){
        var serviceInstance = {};
        serviceInstance.getPaymentInformation=function(orderId){
            return ($http.get(config.baseUrl+"/ecommerce/payment",{
                params:{
                    orderId:orderId,
                    currentUserUrl:window.location.href
                }
            }));
        };
        return serviceInstance;
    }]);

    module.factory('RubedoClickStreamService',['$http','ipCookie',function($http,ipCookie){
        var serviceInstance = {};
        serviceInstance.logEvent=function(event,args){
            if (config.fingerprint) {
                var currentSessionId=ipCookie("sessionId");
                if (!currentSessionId){
                    currentSessionId=Math.random().toString(36).substring(7);
                    var newTS=Date.now() / 1000 | 0;
                    ipCookie("sessionStartTS",newTS,{path:"/",expires:5, expirationUnit:"minutes"});
                }
                ipCookie("sessionId",currentSessionId,{path:"/",expires:5, expirationUnit:"minutes"});
                var payload = {
                    fingerprint:config.fingerprint,
                    url:window.location.href,
                    os:navigator.platform,
                    userAgent:navigator.userAgent,
                    sessionId:currentSessionId,
                    event:event,
                    eventArgs:args
                };
                return ($http({
                    url: config.baseUrl + "/clickstream",
                    method: "POST",
                    data: payload
                }));
            }
        };
        return serviceInstance;
    }]);

    //handle fingerprinting
    module.factory('RubedoFingerprintDataService', ["$http",function($http) {
        var serviceInstance={};
        serviceInstance.loadFingerprintData=function(){
            if (config.fingerprint) {
                $http.get(config.baseUrl + "/fingerprintdata", {
                    params: {
                        fingerprint: config.fingerprint
                    }
                }).then(
                    function (response) {
                        config.fingerPrintData=response.data.data;
                    }
                );
            }
        };
        serviceInstance.getFingerprintData=function(){
            return config.fingerPrintData;
        };
        serviceInstance.logFDChange=function(property,operator,value){
            if (config.fingerprint&&["inc","dec","set"].indexOf(operator)>-1){
                if (typeof(value)=="undefined"){
                    if (operator=="inc"){
                        value=1;
                    } else if (operator=="dec"){
                        value=-1;
                    } else if (operator=="set"){
                        value=null;
                    }
                }
                if (operator=="set"){
                    config[property]=value;
                } else {
                    if (!config[property]){
                        config[property]=0;
                    }
                    if (operator=="inc"){
                        config[property]=config[property]+value;
                    } else if (operator=="dec"){
                        config[property]=config[property]-value;
                    }
                }
                $http({
                    url:config.baseUrl+"/fingerprintdata",
                    method:"POST",
                    data:{
                        fingerprint:config.fingerprint,
                        property:property,
                        operator:operator,
                        value:value
                    }
                });
            }
        };


        return serviceInstance;
    }]);

    if (typeof(Fingerprint2)!="undefined"){
        var injector = angular.injector(['rubedoDataAccess', 'ng']);
        var ipc=injector.get("ipCookie");
        var fpd=injector.get("RubedoFingerprintDataService");

        if (ipc("ruid")){
            config.fingerprint=ipc("ruid");
            fpd.loadFingerprintData();
        } else {
            angular.element(document).ready(function () {
                new Fingerprint2().get(function(result){
                    config.fingerprint=result;
                    ipc("ruid",result,{path:"/",expires:8760, expirationUnit:"hours"});
                    fpd.loadFingerprintData();
                });
            });
        }
    }

})();