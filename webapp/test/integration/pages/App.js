sap.ui.define([
		"sap/ui/test/Opa5",
		"sap/ui/test/matchers/PropertyStrictEquals",
		"com/cozumevi/fiori_smartview/test/integration/pages/Common"
	], function(Opa5, PropertyStrictEquals, Common) {
		"use strict";

		Opa5.createPageObjects({
			onTheAppPage : {
				baseClass : Common,

				actions : {

					iWaitUntilTheAppBusyIndicatorIsGone : function () {
						return this.waitFor({
							id : "app",
							viewName : "App",
							// inline-matcher directly as function
							matchers : function(oAppControl) {
								// we set the view busy, so we need to query the parent of the app
								return oAppControl.getParent() && oAppControl.getParent().getBusy() === false;
							},
							errorMessage : "Did not find the App control"
						});
					}
				},

				assertions : {

					iShouldSeeTheBusyIndicatorForTheWholeApp : function () {
						return this.waitFor({
							id : "app",
							viewName : "App",
							matchers : new PropertyStrictEquals({
								name : "busy",
								value : true
							}),
							success : function () {
								// we set the view busy, so we need to query the parent of the app
								Opa5.assert.ok(true, "The rootview is busy");
							},
							errorMessage : "Did not find the App control"
						});
					},

					iShouldSeeTheMessageBox : function () {
						return this.waitFor({
							searchOpenDialogs: true,
							controlType: "sap.m.Dialog",
							matchers : new PropertyStrictEquals({ name: "type", value: "Message"}),
							success: function () {
								Opa5.assert.ok(true, "The correct MessageBox was shown");
							}
						});
					}
				}
			}
		});
	}
);