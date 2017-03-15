/*
 * File: app/view/productSettingsForm.js
 *
 * This file was generated by Sencha Architect version 3.2.0.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Ext JS 4.2.x library, under independent license.
 * License of Sencha Architect does not include license for Ext JS 4.2.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('Rubedo.view.productSettingsForm', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.productSettingsForm',

    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Number',
        'Ext.form.FieldSet',
        'Ext.form.field.Checkbox',
        'Ext.grid.Panel',
        'Ext.grid.column.Number',
        'Ext.grid.column.Date',
        'Ext.grid.column.Boolean',
        'Ext.grid.View',
        'Ext.grid.plugin.DragDrop',
        'Ext.util.Point',
        'Ext.toolbar.Toolbar',
        'Ext.toolbar.Fill',
        'Ext.button.Button',
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Date'
    ],

    localiserId: 'productSettingsPanel',
    id: 'productSettingsForm',
    title: 'Product settings',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent: function() {
        var me = this;
        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'form',
                    bodyPadding: 10,
                    title: '',
                    items: [
                        {
                            xtype: 'textfield',
                            localiserId: 'skuField',
                            anchor: '100%',
                            fieldLabel: 'SKU',
                            labelWidth: 140,
                            name: 'sku',
                            allowBlank: false,
                            allowOnlyWhitespace: false,
                            listeners: {
                                change: {
                                    fn: me.onTextfieldChange,
                                    scope: me
                                }
                            }
                        },
                        {
                            xtype: 'numberfield',
                            localiserId: 'basePriceField',
                            anchor: '100%',
                            id: 'basePriceField',
                            fieldLabel: 'Base price',
                            labelWidth: 140,
                            name: 'basePrice',
                            allowBlank: false,
                            minValue: 0,
                            listeners: {
                                change: {
                                    fn: me.onBasePriceFieldChange,
                                    scope: me
                                }
                            }
                        },
																								{
                            xtype: 'numberfield',
                            anchor: '100%',
                            id: 'basePriceFieldTTC',
                            fieldLabel: 'Prix de base TTC ',
                            labelWidth: 140,
                            name: 'basePriceTTC',
                            allowBlank: true,
                            minValue: 0,
                            /*listeners: {
                                change: {
                                    fn: me.onBasePriceTTCFieldChange,
                                    scope: me
                                }
                            }*/
                        },
                        {
                            xtype: 'numberfield',
                            localiserId: 'preparationDelayField',
                            anchor: '100%',
                            fieldLabel: 'Preparation delay (days)',
                            labelWidth: 140,
                            name: 'preparationDelay',
                            allowBlank: false,
                            minValue: 0
                        },
                        {
                            xtype: 'fieldset',
                            localiserId: 'stockManagementFieldset',
                            id: 'stockManagentForProductFieldset',
                            title: 'Stock management',
                            items: [
                                {
                                    xtype: 'checkboxfield',
                                    localiserId: 'canOrderOutOfStockField',
                                    anchor: '100%',
                                    fieldLabel: 'Can order out of stock',
                                    labelWidth: 140,
                                    name: 'canOrderNotInStock',
                                    boxLabel: '',
                                    inputValue: 'true',
                                    uncheckedValue: 'false'
                                },
                                {
                                    xtype: 'numberfield',
                                    localiserId: 'outOfStockLimitField',
                                    anchor: '100%',
                                    fieldLabel: 'Out of stock limit',
                                    labelWidth: 140,
                                    name: 'outOfStockLimit',
                                    allowBlank: false,
                                    minValue: 0
                                },
                                {
                                    xtype: 'numberfield',
                                    localiserId: 'notifyForQuantityBelowField',
                                    anchor: '100%',
                                    fieldLabel: 'Notify for stock below',
                                    labelWidth: 140,
                                    name: 'notifyForQuantityBelow',
                                    allowBlank: false,
                                    minValue: 0
                                },
                                {
                                    xtype: 'numberfield',
                                    localiserId: 'resupplyDelayField',
                                    anchor: '100%',
                                    fieldLabel: 'Resupply delay (days)',
                                    labelWidth: 140,
                                    name: 'resupplyDelay',
                                    allowBlank: false,
                                    minValue: 0
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    localiserId: 'variationsGrid',
                    flex: 1,
                    title: 'Variations',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'gridpanel',
                            flex: 1,
                            id: 'productVariationsGrid',
                            title: '',
                            columns: [
                                {
                                    xtype: 'gridcolumn',
                                    dataIndex: 'string',
                                    text: 'String'
                                },
                                {
                                    xtype: 'numbercolumn',
                                    dataIndex: 'number',
                                    text: 'Number'
                                },
                                {
                                    xtype: 'datecolumn',
                                    dataIndex: 'date',
                                    text: 'Date'
                                },
                                {
                                    xtype: 'booleancolumn',
                                    dataIndex: 'bool',
                                    text: 'Boolean'
                                }
                            ],
                            viewConfig: {
                                plugins: [
                                    Ext.create('Ext.grid.plugin.DragDrop', {

                                    })
                                ]
                            },
                            dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    dock: 'top',
                                    items: [
                                        {
                                            xtype: 'tbfill'
                                        },
                                        {
                                            xtype: 'button',
                                            localiserId: 'addBtn',
                                            id: 'variationsAdderBtn',
                                            iconCls: 'add',
                                            text: 'Add',
                                            listeners: {
                                                click: {
                                                    fn: me.onButtonClick,
                                                    scope: me
                                                },
                                                afterrender: {
                                                    fn: me.onVariationsAdderBtnAfterRender,
                                                    scope: me
                                                }
                                            }
                                        },
                                        {
                                            xtype: 'button',
                                            localiserId: 'removeBtn',
                                            disabled: true,
                                            id: 'variationRemoverBtn',
                                            iconCls: 'close',
                                            text: 'Remove',
                                            listeners: {
                                                click: {
                                                    fn: me.onVariationRemoverBtnClick,
                                                    scope: me
                                                }
                                            }
                                        }
                                    ]
                                }
                            ],
                            listeners: {
                                selectionchange: {
                                    fn: me.onProductVariationsGridSelectionChange,
                                    scope: me
                                }
                            },
                            plugins: [
                                Ext.create('Ext.grid.plugin.CellEditing', {

                                })
                            ]
                        },
                        {
                            xtype: 'gridpanel',
                            localiserId: 'specialOffersGrid',
                            disabled: true,
                            id: 'specialOffersGrid',
                            width: 300,
                            collapseDirection: 'right',
                            collapsed: true,
                            collapsible: true,
                            title: 'Special offers for this variation',
                            forceFit: true,
                            store: 'SpecialOffers',
                            dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    dock: 'top',
                                    items: [
                                        {
                                            xtype: 'tbfill'
                                        },
                                        {
                                            xtype: 'button',
                                            handler: function(button, e) {
                                                var price=Ext.getCmp("productVariationsGrid").getSelectionModel().getLastSelected().get("price");
                                                var date=Ext.Date.format(new Date,"U");
                                                button.up().up().getStore().add({
                                                    beginDate:date,
                                                    endDate:date,
                                                    price:price
                                                });
                                            },
                                            localiserId: 'addBtn',
                                            iconCls: 'add',
                                            text: 'Add'
                                        },
                                        {
                                            xtype: 'button',
                                            handler: function(button, e) {
                                                button.up().up().getStore().remove(button.up().up().getSelectionModel().getLastSelected());
                                            },
                                            localiserId: 'removeBtn',
                                            disabled: true,
                                            id: 'removeSpecialOfferBtn',
                                            iconCls: 'close',
                                            text: 'Remove'
                                        }
                                    ]
                                }
                            ],
                            columns: [
                                {
                                    xtype: 'datecolumn',
                                    localiserId: 'startDateCol',
                                    dataIndex: 'beginDate',
                                    text: 'Start date',
                                    editor: {
                                        xtype: 'datefield',
                                        allowBlank: false,
                                        allowOnlyWhitespace: false
                                    }
                                },
                                {
                                    xtype: 'datecolumn',
                                    localiserId: 'endDateCol',
                                    dataIndex: 'endDate',
                                    text: 'End date',
                                    editor: {
                                        xtype: 'datefield',
                                        allowBlank: false,
                                        allowOnlyWhitespace: false
                                    }
                                },
                                {
                                    xtype: 'numbercolumn',
                                    localiserId: 'priceCol',
                                    dataIndex: 'price',
                                    text: 'Price',
                                    editor: {
                                        xtype: 'numberfield',
                                        allowBlank: false,
                                        allowOnlyWhitespace: false,
                                        minValue: 0
                                    }
                                }
                            ],
                            plugins: [
                                Ext.create('Ext.grid.plugin.CellEditing', {

                                })
                            ],
                            listeners: {
                                selectionchange: {
                                    fn: me.onSpecialOffersGridSelectionChange,
                                    scope: me
                                }
                            }
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    },

    onTextfieldChange: function(field, newValue, oldValue, eOpts) {
        if (Ext.getCmp("productVariationsGrid").getStore().getRange().length==1&&!Ext.isEmpty(newValue)){
            Ext.getCmp("productVariationsGrid").getStore().getRange()[0].set("sku",newValue);
        }
    },

    onBasePriceFieldChange: function(field, newValue, oldValue, eOpts) {
        var contentType = Ext.getStore("ContentTypesForContent").getRange().filter(function (el) {
            return el.internalId == Ext.getStore("CurrentContent").getRange()[0].data.typeId;
          });
        console.log(Ext.getStore("CurrentContent").getRange());
        var type = contentType[0].data.type;
        var taxRate = parseFloat(type.split(" ")[0]);
       var form = Ext.getCmp('productSettingsForm').getComponent(0).getForm();
       if (Ext.getCmp("productVariationsGrid").getStore().getRange().length==1&&!Ext.isEmpty(newValue)){
            Ext.getCmp("productVariationsGrid").getStore().getRange()[0].set("price",newValue);
        }
        form.setValues({"basePriceTTC":newValue+taxRate*newValue/100});
    },
    /*onBasePriceTTCFieldChange: function(field, newValue, oldValue, eOpts) {
        var type = Ext.getCmp('TypesContenusGridView').getSelectionModel().getLastSelected().data.type;
        var taxRate = parseFloat(type.split(" ")[0]);
       var form = Ext.getCmp('productSettingsForm').getComponent(0).getForm();
       form.setValues({"basePrice":100*newValue/(taxRate+100)});
      
    },*/
    
    
    onButtonClick: function(button, e, eOpts) {
        var form=button.up().up().up().up().getComponent(0).getForm();
        if (true){
            Ext.Ajax.request({
                url: 'xhr-get-mongo-id',
                params: { },
                success: function(response){
                    var servedId = Ext.JSON.decode(response.responseText).mongoID;
                    button.up().up().getStore().add({price:form.getValues().basePrice,sku:form.getValues().sku,stock:0, id:servedId});
                },
                failure: function(){
                    Ext.Msg.alert(Rubedo.RubedoAutomatedElementsLoc.errorTitle, "Failed to retrieve ID");

                }
            });
        } else {
            Ext.Msg.alert("Error","SKU and Base price are required in order to create variations");
        }

    },

    onVariationsAdderBtnAfterRender: function(component, eOpts) {
        if (Ext.getCmp("productVariationsGrid").getStore().getRange().length==0){
            component.fireEvent("click",component);
        }
        if (Ext.getCmp("productVariationsGrid").getStore().model.getFields().length==5){
            component.disable();
        }
    },

    onVariationRemoverBtnClick: function(button, e, eOpts) {
        button.up().up().getStore().remove(button.up().up().getSelectionModel().getLastSelected());
    },

    onProductVariationsGridSelectionChange: function(model, selected, eOpts) {
        if (Ext.isEmpty(selected)){
            Ext.getCmp("variationRemoverBtn").disable();
            Ext.getCmp("specialOffersGrid").getStore().removeAll();
            Ext.getCmp("specialOffersGrid").disable();
        } else {
            var nbOfVariations=Ext.getCmp("productVariationsGrid").getStore().getRange().length;
            if (nbOfVariations>1){
                Ext.getCmp("variationRemoverBtn").enable();
            } else {
                Ext.getCmp("variationRemoverBtn").disable();
            }

            Ext.getCmp("specialOffersGrid").enable();
            Ext.getCmp("specialOffersGrid").getStore().loadData(selected[0].get("specialOffers"));
        }
    },

    onSpecialOffersGridSelectionChange: function(model, selected, eOpts) {
        if (Ext.isEmpty(selected)){
            Ext.getCmp("removeSpecialOfferBtn").disable();
        } else {
                Ext.getCmp("removeSpecialOfferBtn").enable();

        }
    },

    isValid: function() {
        if (!Ext.getCmp("productSettingsForm").getComponent(0).getForm().isValid()){
            Ext.Msg.alert(Rubedo.RubedoAutomatedElementsLoc.errorTitle,"Invalid product settings");
            return false;
        }
        if (Ext.isEmpty(Ext.getCmp("productVariationsGrid").getStore().getRange())){
            Ext.Msg.alert(Rubedo.RubedoAutomatedElementsLoc.errorTitle,"Product must have at least one variation");
            return false;
        }
        var dataOk=true;
        Ext.Array.forEach(Ext.Array.pluck(Ext.getCmp("productVariationsGrid").getStore().getRange(),"data"),function(variation){
            Ext.Object.each(variation, function(key, value, myself) {
                if ((Ext.isEmpty(value))&&(key!="specialOffers")){
                    dataOk=false;
                }
            });
        });
        if (!dataOk){
            Ext.Msg.alert(Rubedo.RubedoAutomatedElementsLoc.errorTitle,"Invalid variation settings. Each variation must have a valid value for each column");
        }
        return dataOk;
    }

});