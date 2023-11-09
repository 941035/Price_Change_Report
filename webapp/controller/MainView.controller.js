sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/library",
	"sap/ui/export/Spreadsheet"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,JSONModel,exportLibrary,Spreadsheet) {
        "use strict";

        return Controller.extend("com.parker.pricechangereport.controller.MainView", {
            onInit: function () {
                this.oDataModel = this.getOwnerComponent().getModel();
            },
            onDateSelection: function(oEvent){
                var that=this;
                var dateFrom = this.byId("selectedDate").getDateValue();
				var dateTo = this.byId("selectedDate").getSecondDateValue();
                var selDate1 = this.getOrignalTime(this.setLocalTimeZoneZone(dateFrom));
                var selDate2 = this.getOrignalTime(this.setLocalTimeZoneZone(dateTo));
               
               
                this.oDataModel.read("/zscs_cdhdr(p_date='"+ selDate1.replaceAll("-","")+ "',p_date1='" + selDate2.replaceAll("-","") + "')/Set", {
                    success: function (oData) {
                        if(that.getOwnerComponent().getModel("ViewModel") != undefined){
                            that.getOwnerComponent().getModel("ViewModel").setData({"DataSet":[]})
                        }
                        var dataModel = new JSONModel();
                        dataModel.setData({
                            DataSet: oData.results
                        });
                        that.getOwnerComponent().setModel(dataModel, "ViewModel")
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error while fetching data");
                        console.log(oError);

                    }
                });

            },
            dateFormat: function(date){
                if((date === null) || (date ==="")){
                    return null;
                }
                else{
                    var dte=  date.replaceAll(".","-").split("-");
                    return dte[2] + "-" + dte[1] + "-" + dte[0];
                }
                
            },
            getOrignalTime: function(dateTime){
                if (dateTime !== undefined && dateTime !== null && dateTime !== "") {
                    var dateFormat = sap.ui.core.format.DateFormat.getInstance({
                        UTC: true,
                        pattern: 'yyyy-MM-dd',
                        style: "short"
                    });
                    var originalDate = dateFormat.format(new Date(dateTime));
                    return originalDate;
                }
                return null;
            },
            setLocalTimeZoneZone : function (datevalue) {
                // var orgDate = this.getOrignalTime(datevalue);
                // console.log(orgDate);
                // return orgDate;
                 var dateTime = new Date(datevalue);
                if ((datevalue === null) || (datevalue ==="")) {
                     return null;
                 }
                else if (dateTime !== undefined && dateTime !== null && dateTime !== "") {
                     var offSet = dateTime.getTimezoneOffset();
                     var offSetVal = dateTime.getTimezoneOffset() / 60;
                   var h = Math.floor(Math.abs(offSetVal));
                     var m = Math.floor((Math.abs(offSetVal) * 60) % 60);
                     dateTime = new Date(dateTime.setHours(h, m, 0, 0));
                     return dateTime;
                 }
                 else {
                     return null;
                 }
            },
            createColumnConfig: function() {
                return [
                    {
                        label: 'Purchasing Document',
                        property: 'objectid'
                       
                    },
                    {
                        label: 'Purchasing Group',
                        property: 'Pur_grp',
                      
                    },
                    {
                        label: 'Line Item',
                        property: 'line_item',
                      
                    },
                    {
                        label: 'Material Number',
                        property: 'material',
                      
                    },
                    {
                        label: 'Material Description',
                        property: 'material_text',
                      
                    },
                    {
                        label: 'Vendor Number',
                        property: 'vendor',
                      
                    },
                    {
                        label: 'Vendor Description',
                        property: 'vendor_text',
                      
                    },
                    {
                        label: 'Old Value',
                        property: 'old_netwr',
                      
                    },
                    {
                        label: 'New Value',
                        property: 'new_netwr',
                      
                    },
                    {
                        label: 'Changed Value',
                        property: 'change_value',
                      
                    },
                    {
                        label: 'Changed Percentage',
                        property: 'percent_change_value',
                      
                    },
                    {
                        label: 'Changed Date',
                        property: 'newdate',
                      
                    }
                  ];
            },
            onPressExport: function() {
                var aCols, oBinding, oSettings, oSheet, oTable;
    
                oTable = this.byId("reportTable");
                oBinding = oTable.getBinding("items");
                aCols = this.createColumnConfig();
    
                oSettings = {
                    workbook: { columns: aCols,
                        context: {
                            sheetName: 'Exported Data'
                        } },
                    dataSource: oBinding,
                    fileName: 'Exported File'
                };
    
                oSheet = new Spreadsheet(oSettings);
                oSheet.build()
                    .then(function() {
                        MessageToast.show('Report Downloaded');
                    }).finally(function() {
                        oSheet.destroy();
                    });
            }
        });
    });
