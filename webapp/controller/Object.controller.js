/*global location*/
sap.ui.define([
	"com/cozumevi/fiori_smartview/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/cozumevi/fiori_smartview/model/formatter"
], function( BaseController, JSONModel, History, formatter) {
	"use strict";

	return BaseController.extend("com.cozumevi.fiori_smartview.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			var viewModel = new JSONModel();
			this.getView().setModel(viewModel, "view");
			this.getOwnerComponent().getModel().setSizeLimit(1000);
			this.getView().byId("smartTable").setModel(this.getOwnerComponent().getModel());

			var oSmartTable = this.getView().byId("smartTable");
			var oTable = oSmartTable.getTable();

			if (oTable) {
				oTable.setVisibleRowCountMode("Fixed"); // Yüksekliği sabitlemek için
				oTable.setVisibleRowCount(12); // Örneğin, 10 satır gösterecek şekilde ayarlayın
			}
		},

		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		// onBeforeExport: function(oEvt) {
		// 	var columns = oEvt.getParameter("exportSettings").workbook.columns;
		// 	for (var i = 0; i < columns.length; i++) {
		// 		if (columns[i].property === "actDate") {
		// 			columns[i].type = "date";
		// 		}
		// 	}

		// 	var mExcelSettings = oEvt.getParameter("exportSettings");
		// 	var conflen = mExcelSettings.dataSource.count;
		// 	var contextData = [];
		// 	for (var rowNum = 0; rowNum < conflen; rowNum++) {
		// 		var obj = oEvt.getSource().getTable().getContextByIndex(rowNum).getObject();
		// 		contextData.push(obj);
		// 	}
		// 	mExcelSettings.dataSource = contextData;
		// },

		onSearch: function(oEvent) {
			var oSmartTable = this.getView().byId("smartTable");
			if (oSmartTable) {
				oSmartTable.rebindTable();
			}
		},

		onBeforeRebindTable: function(oEvent) {
			var oBindingParams = oEvent.getParameter("bindingParams"),
				oSmartFilterBar = this.getView().byId("smartFilterBar"),
				vStarDate = this.byId("idPdate").getDateValue(),
				vEndDate = this.byId("idPdate").getSecondDateValue();
			if (oSmartFilterBar.getFilterData.length) {
				if (oSmartFilterBar.getFilterData().actTeam !== undefined) {
					for (var i = 0; i < oSmartFilterBar.getFilterData().actTeam.items.length; i++) {
						var oFilter = new sap.ui.model.Filter("actTeam", sap.ui.model.FilterOperator.EQ, oSmartFilterBar.getFilterData().actTeam.items[i]
							.key);
						oBindingParams.filters.push(oFilter);
					}
				}

				if (oSmartFilterBar.getFilterData().actCustomer !== undefined) {
					for (i = 0; i < oSmartFilterBar.getFilterData().actCustomer.items.length; i++) {
						oFilter = new sap.ui.model.Filter("actCustomer", sap.ui.model.FilterOperator.EQ, oSmartFilterBar.getFilterData().actCustomer.items[
								i]
							.key);
						oBindingParams.filters.push(oFilter);
					}
				}
			}

			if (vStarDate !== undefined && vStarDate !== "") {
				vStarDate.setHours(12, 0, 0);
				vEndDate.setHours(12, 0, 0);
				oFilter = new sap.ui.model.Filter("actDate", sap.ui.model.FilterOperator.BT, vStarDate, vEndDate);
				oBindingParams.filters.push(oFilter);
			}
		}
	});

});