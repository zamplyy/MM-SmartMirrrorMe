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
    mmSocket.emit('message', '--TEST--ASD--')

    socket.on('message', (message) => {
        console.log(message)
        socket.emit('message', 'Your socket id: ' + socket.id)
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

        message.forEach(item => {
            console.log(item.key)
        });
        console.log('Need to translate and forward to MM')
    });

    socket.on('getLayout', (message) => {
        console.log('getLayout')
        console.log('Need to translate and forward to MM')
    });

    socket.on('installModule', (message) => {
        console.log('installModule ')
        console.log('Name is : ' + message.name)
        console.log('Url is : ' + message.Url)
        console.log('Need to translate and forward to MM')
    });
    

});


