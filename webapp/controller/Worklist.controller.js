/*global location history */
sap.ui.define([
	"com/cozumevi/fiori_smartview/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/cozumevi/fiori_smartview/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/unified/DateTypeRange"
], function(BaseController, JSONModel, formatter, Filter, FilterOperator, ODataModel, DateTypeRange) {
	"use strict";

	return BaseController.extend("com.cozumevi.fiori_smartview.controller.Worklist", {

		formatter: formatter,
		onInit: function() {
			// var sUrl = "/sap/opu/odata/sap/ZABAP_SV_ACTIVITY_SRV/";
			// var oModel = new ODataModel(sUrl, {
			// 	json: true,
			// 	useBatch: true,
			// 	refreshAfterChange: false,
			// 	defaultBindingMode: "TwoWay"
			// });
			// this.getView().setModel(oModel);

			var viewModel = new JSONModel();
			this.getView().setModel(viewModel, "view");
			this.getOwnerComponent().getModel().setSizeLimit(1000);
			this.getRouter().getRoute("worklist").attachPatternMatched(this._onObjectMatched, this);

			//Smarttable yükseliklik ayarı
			var oSmartTable = this.getView().byId("smartTable");
			var oTable = oSmartTable.getTable();
			if (oTable) {
				oTable.setVisibleRowCountMode("Fixed"); // Yüksekliği sabitlemek için
				oTable.setVisibleRowCount(14); // Örneğin, 10 satır gösterecek şekilde ayarlayın
			}

			this.oHelpModel = new JSONModel({
				"Visible": ""
			});
			this.getView().setModel(this.oHelpModel, "fragmentModel");
		},

		_onObjectMatched: function() {
			this.setCalendarSpecialDates();
		},

		setCalendarSpecialDates: function() {
			var oModel = this.getOwnerComponent().getModel(),
				oCalendar = this.byId("calendarAct"),
				aFilters = [];
			oCalendar.destroySpecialDates();
			oCalendar.setBusy(true);

			aFilters.push(new sap.ui.model.Filter("actMySelf", sap.ui.model.FilterOperator.EQ, true));
			aFilters.push(new sap.ui.model.Filter("actRequestSchedule", sap.ui.model.FilterOperator.EQ, true));
			oModel.read("/ReportSet", {
				filters: aFilters,
				success: function(oData) {
					for (var i = 0, len = oData.results.length; i < len; i++) {
						var dateTypeRangeTemp = new DateTypeRange({
							"type": oData.results[i].actScheduleType,
							"startDate": oData.results[i].actDate,
							"endDate": oData.results[i].actDate
						});
						oCalendar.addSpecialDate(dateTypeRangeTemp);
					}
					oCalendar.setBusy(false);
				},
				error: function() {
					oCalendar.setBusy(false);
				}
			});
		},

		onDataReceived: function(oEvent) {
			var oTable = this.getView().byId("smartTable");
			var i = 0;

			oTable.getTable().getColumns().forEach(function(oLine) {
				oLine.setWidth("auto");
				oLine.getTemplate().setProperty("wrapping", true);
				oLine.getParent().autoResizeColumn(i);
				i++;
			});
		},

		handleCalendarSelect: function(oEvent) {
			this._aFilters = [];
			var vDate = oEvent.getSource().getSelectedDates()[0].mProperties.startDate;
			vDate.setHours(12, 0, 0);
			this._aFilters.push(new Filter("actRequestDate", FilterOperator.EQ, vDate));
			this.byId("smartTable").rebindTable();
		},

		onBeforeExport: function(oEvt) {
			// var columns = oEvt.getParameter("exportSettings").workbook.columns;
			// for (var i = 0; i < columns.length; i++) {
			// 	if (columns[i].property === "actDate") {
			// 		columns[i].type = "date";
			// 	}
			// }

			// var mExcelSettings = oEvt.getParameter("exportSettings");
			// var conflen = mExcelSettings.dataSource.count;
			// var contextData = [];
			// for (var rowNum = 0; rowNum < conflen; rowNum++) {
			// 	var obj = oEvt.getSource().getTable().getContextByIndex(rowNum).getObject();
			// 	contextData.push(obj);
			// }
			// mExcelSettings.dataSource = contextData;
		},

		onCustomAction: function(oEvent) {
			var vButtonType = oEvent.getSource().getId().split("-")[8];
			if (vButtonType === "btDisplay") {
				this.getView().getModel("fragmentModel").setProperty("/Visible", false);
			} else {
				this.getView().getModel("fragmentModel").setProperty("/Visible", true);
			}

			var vActNo = oEvent.getSource().getBindingContext().getObject().actNo.toString();
			this.getView().getModel().metadataLoaded().then(function() {
				var oDialog = this.getActivity();
				var sPath = "/CreateActivictySet(actNo='" + vActNo + "')";
				var oModel = this.getView().getModel();
				oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
				var oNewContext = oModel.createBindingContext(sPath);
				oDialog.setBindingContext(oNewContext);

				oDialog.open();
				oDialog.bindElement(sPath);
			}.bind(this)).catch(function(oError) {
				// console.error("Metadata yüklenirken hata oluştu:", oError);
			});
		},

		onBeforeRebindTable: function(oEvent) {
			var oBindingParams = oEvent.getParameter("bindingParams");
			var oFilter1 = new sap.ui.model.Filter("actMySelf", sap.ui.model.FilterOperator.EQ, true);
			oBindingParams.filters.push(oFilter1);

			if (this._aFilters !== undefined) {
				oFilter1 = new sap.ui.model.Filter("actRequestDate", sap.ui.model.FilterOperator.EQ, this._aFilters[0].oValue1);
				oBindingParams.filters.push(oFilter1);
			}
		},

		createAct: function(oEvent) {
			var that = this;
			this.getView().getModel("fragmentModel").setProperty("/Visible", true);
			this.getView().getModel().metadataLoaded().then(function() {
				var oContext = this.getView().getModel().createEntry("/CreateActivictySet");
				var oDialog = this.getActivity();
				var sPath = oContext.getPath();

				var oModel = this.getView().getModel();
				oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
				var oNewContext = oModel.createBindingContext(sPath);
				oDialog.setBindingContext(oNewContext);
				oDialog.open();

				oDialog.bindElement(sPath);
				oDialog.updateBindingContext(true);

			}.bind(this)).catch(function(oError) {
				that.showMessages(oError.responseText);
			});
		},

		onShowTeamReport: function() {
			this.getRouter().navTo("object", {
				actNo: "null"
			});
		},

		handleSave: function() {
			var that = this,
				fragmentData = sap.ui.getCore().byId("activityPopup").getBindingContext().getObject(),
				oModel = this.getView().getModel(),
				vFlag = this.onValidateFieldsInFragment();

			if (vFlag !== false) {
				sap.ui.core.BusyIndicator.show();
				oModel.submitChanges({
					success: function(oData, response) {
						sap.ui.core.BusyIndicator.hide();
						// that.showMessages(oResponse.data.__batchResponses[0].response.body);
					},
					error: function(oError) {
						sap.ui.core.BusyIndicator.hide();
					}
				});
			}
		},

		handleClose: function() {
			this.getActivity().close();
		},

		onValidateFieldsInFragment: function() {
			// Fragment içindeki tüm SmartField bileşenlerini bul
			var aSmartFields = this.oActivityDialog.findAggregatedObjects(true, function(oControl) {
				return oControl.isA("sap.ui.comp.smartfield.SmartField");
			});

			var bIsValid = true;
			aSmartFields.forEach(function(oField) {
				var oInnerControl = oField.getInnerControls()[0]; // SmartField içindeki gerçek input'u al
				if (oField.getMandatory() === true && oField.getVisible() !== false && (!oInnerControl.getValue() || oInnerControl.getValue().trim() ===
						"")) {
					oInnerControl.setValueState("Error");
					oInnerControl.setValueStateText("Bu alan zorunludur");
					bIsValid = false;
				} else {
					oInnerControl.setValueState("None");
				}
			});

			if (!bIsValid) {
				sap.m.MessageBox.error("Lütfen zorunlu alanları doldurun.");
			} else {
				sap.m.MessageToast.show("Tüm alanlar geçerli!");
			}
			return bIsValid;
		},

		onNavBack: function() {
			history.go(-1);
		}
	});
});