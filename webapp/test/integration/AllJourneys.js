/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"com/cozumevi/fiori_smartview/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/cozumevi/fiori_smartview/test/integration/pages/Worklist",
	"com/cozumevi/fiori_smartview/test/integration/pages/Object",
	"com/cozumevi/fiori_smartview/test/integration/pages/NotFound",
	"com/cozumevi/fiori_smartview/test/integration/pages/Browser",
	"com/cozumevi/fiori_smartview/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.cozumevi.fiori_smartview.view."
	});

	sap.ui.require([
		"com/cozumevi/fiori_smartview/test/integration/WorklistJourney",
		"com/cozumevi/fiori_smartview/test/integration/ObjectJourney",
		"com/cozumevi/fiori_smartview/test/integration/NavigationJourney",
		"com/cozumevi/fiori_smartview/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});