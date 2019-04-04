/* global Module */

/* Magic Mirror
 * Module: MM-MagicMirrorMe
 *
 * By 
 * MIT Licensed.
 */

Module.register("MM-MagicMirrorMe", {
	defaults: {
		updateInterval: 60000,
		retryDelay: 5000
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var ipAdress = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		this.sendSocketNotification("getIp")
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.innerHTML = "SmartMirror IP: " + ipAdress;
		return wrapper;
	},

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"MM-MagicMirrorMe.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

	processData: function(data) {
		var self = this;
		this.dataRequest = data;
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;

		// the data if load
		// send notification to helper
		this.sendSocketNotification("MM-MagicMirrorMe-NOTIFICATION_TEST", data);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "MM-MagicMirrorMe-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}
		else if (notification === "GET_LAYOUT"){
			let modules = []
			MM.getModules().exceptModule(this).exceptWithClass(['alert','updatenotification', 'MMM-Dynamic-Modules']).enumerate(function(module) {
				var obj = {}
				var moduleName = module.data.name
				var modulePosition = module.data.position
				obj.name = moduleName
				obj.position = modulePosition
				
				modules.push(obj)

			});
			this.sendSocketNotification("SET_LAYOUT", modules);

		}
		else if (notification === "setIp"){
			ipAdress = payload;
		}
		else if (notification === "SHOW_MODULE"){
			MM.getModules().exceptModule(this).exceptWithClass(['alert','updatenotification', 'MMM-Dynamic-Modules']).enumerate(function(module) {
				if(module.data.name == payload){
					module.show(1000, function() {
						//Module hidden.
					});
				}
			});
		}
		else if (notification === "HIDE_MODULE"){
			MM.getModules().exceptModule(this).enumerate(function(module) {
				if(module.data.name == payload){
					module.hide(1000, function() {
						//Module hidden.
					});
				}
			});
		}
		else if (notification === "HIDE_ALL"){
			MM.getModules().exceptModule(this).enumerate(function(module) {
				module.hide(1000, function() {
					//Module hidden.
				});
				
			});
		}
		else if (notification === "SHOW_ALL"){
			MM.getModules().exceptModule(this).exceptWithClass(['alert','updatenotification', 'MMM-Dynamic-Modules']).enumerate(function(module) {
				module.show(1000, function() {
				});
			});
		}


		else if (notification === "CHANGE_POSITION"){
			self = this
		
			this.sendNotification('CHANGE_POSITIONS', modules = payload);
			//SHOW ALL
			MM.getModules().exceptModule(this).exceptWithClass(['alert','updatenotification', 'MMM-Dynamic-Modules']).enumerate(function(module) {
				module.show(1000, function() {
					//Module hidden.
				});
			});
			//ALL SHOWN
		}
	},
});
