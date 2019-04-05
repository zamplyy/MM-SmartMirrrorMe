/* Magic Mirror
 * Node Helper: MM-MagicMirrorMe
 *
 * By 
 * MIT Licensed.
 */
const express = require('express');
const http = require('http')
const socketio = require('socket.io');
const os = require('os');
const fs = require('fs');

const app = express();
const server = http.Server(app);
const websocket = socketio(server);


var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({


	start(){

		//Started node_helper
		this.openBridgeSocket();
	},

	openBridgeSocket(){

		server.listen(18005, () => console.log('---server, listening on port 18005---'));
		global.superSocket = ""
		// The event will be called when a client is connected.
		websocket.on('connection', (socket) => {
			console.log('A client just joined on', socket.id);
			global.superSocket = socket

			socket.on('message', (message) => {
				console.log(message)
			});

			socket.on('mmGetLayout', (message) => {

				this.sendSocketNotification("GET_LAYOUT");
			});

			socket.on('mmShowModule', (message) => {

				this.sendSocketNotification("SHOW_MODULE", message);
			});

			socket.on('mmHideModule', (message) => {

				this.sendSocketNotification("HIDE_MODULE", message);
			});

			socket.on('mmShowAll', (message) => {
				this.sendSocketNotification("SHOW_ALL");
			});

			socket.on('mmHideAll', (message) => {
				this.sendSocketNotification("HIDE_ALL");
			});

			socket.on('mmGetModuleConfig', (message) => {
				this.sendSocketNotification("GET_MODULE_CONFIG", message);
			});

			socket.on('mmGetInstalledModules', (message) => {
				var modules = fs.readdirSync("../MagicMirror/modules/");
				var defaultModules = fs.readdirSync("../MagicMirror/modules/default");
				modules = modules.concat(defaultModules)
				toRemove = ['MM-MagicMirrorMe',
					'MMM-Dynamic-Modules',
					'README.md',
					'default',
					'node_modules',
					]

				modules = modules.filter( function( el ) {
					return toRemove.indexOf( el ) < 0;
				  } );
				  socket.emit("mmSetInstalledModules",modules)
			});

			socket.on('mmToggleIp', (message) => {
				console.log("mmToggleIp " + message)
				if(message == false){
					this.sendSocketNotification("HIDE_MODULE", message);
				} else {
					this.sendSocketNotification("SHOW_MODULE", message)
				}
			});

			socket.on('mmChangePosition', (message) => {
				
				const arrayToObject = (array, keyField) =>
				array.reduce((obj, item) => {
					obj[item[keyField]] = item
					return obj
				}, {})
                
				const modulesObject = arrayToObject(message, "name")

				Object.keys(modulesObject).forEach(function(item) {
					delete modulesObject[item].name;
					modulesObject[item].visible = 'false';
				});

				console.log(modulesObject)
				
				this.sendSocketNotification("CHANGE_POSITION", modulesObject);
			});

		});
	},

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		if (notification === "MM-MagicMirrorMe-NOTIFICATION_TEST") {
			console.log("Working notification system. Notification:", notification, "payload: ", payload);
			// Send notification
			this.sendNotificationTest(this.anotherFunction()); //Is possible send objects :)
		}
		else if (notification === "SET_LAYOUT"){
			global.superSocket.emit('mmSetLayout', payload)
		}
		else if (notification === "SET_MODULE_CONFIG"){
			global.superSocket.emit('mmSetModuleConfig', payload)
		}
		else if (notification === "getIp"){
			console.log("getIp")
			var networkInterfaces = os.networkInterfaces( );
			var ipAddress = networkInterfaces.wlan0[0].address;
			console.log("respoe from getIp: " + ipAddress)
			this.sendSocketNotification("setIp", ipAddress)
		}
	},

	// Example function send notification test
	sendNotificationTest: function(payload) {
		this.sendSocketNotification("MM-MagicMirrorMe-NOTIFICATION_TEST", payload);
	},

	// this you can create extra routes for your module
	extraRoutes: function() {
		var self = this;
		this.expressApp.get("/MM-MagicMirrorMe/extra_route", function(req, res) {
			// call another function
			values = self.anotherFunction();
			res.send(values);
		});
	},

	// Test another function
	anotherFunction: function() {
		return {date: new Date()};
	}
});
