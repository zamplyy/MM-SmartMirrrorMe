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
const util = require('util');

var moduleFolderPath = __dirname + '/'
var a = __dirname.split('/');
var moduleFolderPath = moduleFolderPath.replace(a[a.length-1] + '/', '');

const simpleGit = require('simple-git')(moduleFolderPath);

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

			socket.on('mmRestart', (message) => {
				require('child_process').exec('pm2 restart mm', function (msg) { console.log(msg) });
			});

			socket.on('mmSaveModules', (message) => {
				console.log('saveModules')
				//Should first write prefix to file
				//Then it should write modules : []
				//Then it should write suffix
				
				let prefix = ""
				let suffix = ""

				try {  
					prefix = fs.readFileSync(__dirname + '/prefix.txt', 'utf8');
				} catch(e) {
					console.log('Error:', e.stack);
				}

				try {  
					suffix = fs.readFileSync(__dirname + '/suffix.txt', 'utf8');
				} catch(e) {
					console.log('Error:', e.stack);
				}

				var prefixModules = [
					{
						module: "alert",
					},
					{
						module: "updatenotification",
						position: "top_bar"
					},
					{
						module: "MM-MagicMirrorMe",
						position: "bottom_left"
					},
					{
						module: "MMM-Dynamic-Modules",
					},
				]

				message.forEach(module => {
					var pos = module.position
					module.module = module.name
					delete module.name
					delete module.position
					module.position = pos
					prefixModules.push(module)
				});

				//ADD EXTRA CONFIG DETAILS FOR CALENDAR AND WEATHER FOR NOW

				prefixModules.forEach(module => {

					if (module.module == 'calendar') {
						module.header = 'SWE Holidays'
						module.config = {
							calendars : [ 
								{
									symbol : "calendar-check",
									url : "https://www.calendarlabs.com/ical-calendar/ics/71/Sweden_Holidays.ics"
								}
							]
						}
					}
					if (module.module == 'currentweather') {
						module.config = {
							location : "Karlstad",
							locationID : "2701680",
							appid : "2ea660f74981297e2329a05d0e9b0fd9",
						}
					}
					
				});

				configFile = prefix + '\nmodules : ' +util.inspect(prefixModules, {depth:7}) + '\n' +suffix
				
				var configFolderPath = __dirname

				var the_arr = configFolderPath.split('/');
				the_arr.pop();
				the_arr.pop();
				configFolderPath = the_arr.join('/')

				configFolderPath = configFolderPath + "/config"

				fs.writeFile(configFolderPath + '/config.js', configFile , (err) => {  
					if(err) {
						console.log(err)
					}
					console.log('Wrote config to ' + configFolderPath )
				});
			});

			socket.on('mmInstallModule', (message) => {

				console.log('MM Should install this module: ', message);

				simpleGit.clone(message.Url)
					.then( () => console.log('finished'));


				//Installed in directory
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
					'alert',
					'defaultmodules.js',
					'updatenotification',
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

			if(networkInterfaces.wlan0 != undefined){
				var ipAddress = networkInterfaces.wlan0[0].address;
				console.log("respoe from getIp: " + ipAddress)
				this.sendSocketNotification("setIp", ipAddress)
			} 
			
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
