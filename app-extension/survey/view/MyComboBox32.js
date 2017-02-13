/*
 * File: app/view/MyComboBox32.js
 *
 * This file was generated by Sencha Architect version 2.2.2.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Ext JS 4.1.x library, under independent license.
 * License of Sencha Architect does not include license for Ext JS 4.1.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('Rubedo.view.MyComboBox32', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.mycombobox32',

    localiserId: 'showOnlyIfCombo',
    fieldLabel: 'Affiché si et seulement si ',
    labelWidth: 170,
    name: 'field',
    editable: false,
    displayField: 'qNb',
    forceSelection: true,
    queryMode: 'local',
    store: 'FCEStore',
    valueField: 'id',

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            listeners: {
                change: {
                    fn: me.onComboboxChange,
                    scope: me
                }
            }
        });

        me.processMyComboBox32(me);
        me.callParent(arguments);
    },

    processMyComboBox32: function(config) {
        config.plugins=[Ext.create("Ext.ux.form.field.ClearButton")];
        return config;
    },

    onComboboxChange: function(field, newValue, oldValue, eOpts) {
        field.up().getComponent("answerFieldComponent").removeAll();
        var targeted=field.getStore().findRecord("id",newValue);
        if (!Ext.isEmpty(targeted)){
            var conf=Ext.clone(targeted.get("itemConfig"));
            if (conf.fieldType=="radiogroup"){
                conf.fieldType="checkboxgroup";
            }
            if (!Ext.isEmpty(conf.fieldConfig.items)){
                Ext.Array.forEach(conf.fieldConfig.items, function(item){item.name="value";});
            }
            var previewField = Ext.widget(conf.fieldType, conf.fieldConfig);
            previewField.fieldLabel="";
            previewField.flex=1;
            previewField.name="value";
            previewField.hideEmptyLabel=true;
            field.up().getComponent("answerFieldComponent").add(previewField);
        }
    }

});