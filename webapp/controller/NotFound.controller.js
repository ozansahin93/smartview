sap.ui.define([
		"com/cozumevi/fiori_smartview/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("com.cozumevi.fiori_smartview.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);