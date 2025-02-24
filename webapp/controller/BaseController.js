sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.cozumevi.fiori_smartview.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		getActivity: function() {
			if (!this.oActivityDialog) {
				this.oActivityDialog = sap.ui.xmlfragment("com.cozumevi.fiori_smartview.fragment.activityCreate", this);
				this.getView().addDependent(this.oActivityDialog);
			}
			return this.oActivityDialog;
		},

		showMessages: function(bapiret, Statu) {
			var messageHandler = this.getOwnerComponent().MessageHandler;
			var oMessageManager = sap.ui.getCore().getMessageManager();
			var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
			if (bapiret.length) {
				// oMessageManager.removeAllMessages();
				for (var a in bapiret) {
					if (bapiret[a].Type === "E") {
						oMessageManager.addMessages(
							new sap.ui.core.message.Message({
								message: bapiret[a].Message,
								type: sap.ui.core.MessageType.Error,
								processor: oMessageProcessor
							})
						);
					} else if (bapiret[a].Type === "S") {
						oMessageManager.addMessages(
							new sap.ui.core.message.Message({
								message: bapiret[a].Message,
								type: sap.ui.core.MessageType.Success,
								processor: oMessageProcessor
							})
						);
					} else if (bapiret[a].Type === "W") {
						oMessageManager.addMessages(
							new sap.ui.core.message.Message({
								message: bapiret[a].Message,
								type: sap.ui.core.MessageType.Warning,
								processor: oMessageProcessor
							})
						);
					}
				}
				this.showServiceMessages();

			}
		},

		showServiceMessages: function() {
			var that = this;
			if (this._bMessageOpen) {
				return;
			}
			this._bMessageOpen = true;
			var oMessageTemplate = new sap.m.MessageItem({
				type: "{message>type}",
				title: "{message>message}",
				description: "{message>description}",
				subtitle: "{message>additionalText}"
			});
			var oBackButton = new sap.m.Button({
				icon: sap.ui.core.IconPool.getIconURI("nav-back"),
				visible: false,
				press: function() {
					that.oMessageView.navigateBack();
					this.setVisible(false);
				}
			});
			this.oMessageView = new sap.m.MessageView({
				showDetailsPageHeader: true,
				itemSelect: function() {
					oBackButton.setVisible(true);
				},
				items: {
					path: "message>/",
					template: oMessageTemplate
				}
			});
			this.oDialog = new sap.m.Dialog({
				resizable: true,
				draggable: true,
				content: this.oMessageView,
				afterClose: function() {
					that._bMessageOpen = false;
					sap.ui.getCore().getMessageManager().removeAllMessages();
				},
				beginButton: new sap.m.Button({
					press: function() {
						this.getParent().close();
						that.getRouter().navTo("IsListesi", {});
					},
					text: "Kapat"
				}),
				customHeader: new sap.m.Bar({
					contentMiddle: [
						new sap.m.Text({
							text: "{i18n>messageDialogTitle}"
						})
					],
					contentLeft: []
				}),
				contentHeight: "300px",
				contentWidth: "500px",
				verticalScrolling: false
			});
			// set message model
			this.oDialog.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");
			this.oMessageView.navigateBack();
			this.oDialog.open();
		}
	});

});