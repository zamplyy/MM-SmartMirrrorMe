var express = require('express');
var http = require('http')
var socketio = require('socket.io');
const io = require('socket.io-client');

var app = express();
var server = http.Server(app);
var websocket = socketio(server);
server.listen(18000, () => console.log('Starting Bridge server, listening on port 18000'));

// The event will be called when a client is connected.
websocket.on('connection', (socket) => {
    console.log('A client just joined on', socket.id);

    const mmSocket = io("http://127.0.0.1:18005");

    mmSocket.on('mmSetLayout', (message) => {
        console.log('From MM mmSetLayout : ' +message)
        socket.emit('layout', message)
    });

    mmSocket.on('mmSetModuleConfig', (message) => {
        console.log('From MM mmSetModuleConfig : ' +message)
        socket.emit('setModuleConfig', message)
    });

    mmSocket.on('mmSetInstalledModules', (message) => {
        console.log('From MM mmSetInstalledModules : ' +message)
        socket.emit('setInstalledModules', message)
    });

    socket.on('message', (message) => {
        console.log(message)
        socket.emit('message', 'Your socket id: ' + socket.id)
    });

    socket.on('toggleIp', (message) => {
        console.log("toggleIp" + message)
        mmSocket.emit('mmToggleIp', message)
    });

    socket.on('getModuleConfig', (message) => {
        console.log("getModuleConfig" + message)
        mmSocket.emit('mmGetModuleConfig', message)
    });

    socket.on('getInstalledModules', (message) => {
        console.log("getInstalledModules" + message)
        mmSocket.emit('mmGetInstalledModules', message)
    });

    socket.on('hide', (message) => {
        console.log('hide ' + message)
        mmSocket.emit('mmHideModule', message)
    });

    socket.on('show', (message) => {
        console.log('show ' + message)
        mmSocket.emit('mmShowModule', message)
    });

    socket.on('hideAll', (message) => {
        console.log('hideAll')
        mmSocket.emit('mmHideAll', message)
    });

    socket.on('showAll', (message) => {
        console.log('showAll')
        mmSocket.emit('mmShowAll', message)
    });

    socket.on('restart', (message) => {
        console.log('restart ' + message)
        console.log('Need to translate and forward to MM')
    });

    socket.on('brightness', (message) => {
        console.log('brightness ' + message)
        console.log('Need to translate and forward to MM')
    });

    socket.on('changePosition', (message) => {
        console.log('changePosition ' + message)
        
        mmSocket.emit('mmChangePosition', message)
    });

    socket.on('getLayout', (message) => {
        console.log('getLayout')
        mmSocket.emit('mmGetLayout')
    });

    socket.on('installModule', (message) => {
        console.log('installModule ')
        console.log('Name is : ' + message.name)
        console.log('Url is : ' + message.Url)
        console.log('Need to translate and forward to MM')
    });
    

});


