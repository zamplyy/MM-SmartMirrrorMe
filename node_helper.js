/* Magic Mirror
 * Node Helper: MM-MagicMirrorMe
 *
 * By 
 * MIT Licensed.
 */
const express = require('express');
const http = require('http')
const socketio = require('socket.io');

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
