Ext.define('Rubedo.controller.AcnController', {
    extend: 'Ext.app.Controller',
    alias: 'controller.AcnController',

    


    init: function(application) {
        RubedoExtendableSettings.orderStatusList.push(["shipped","Shipped"]);
    }

});