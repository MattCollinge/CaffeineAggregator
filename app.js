var express = require('express');

var http = require('http');
var io = require('socket.io');
var URL = require('url');
var fs = require('fs');

var publisher = {
    publish: function(){}
}

var app = express();
server = http.createServer(app);

var socketioserver = io.listen(server);

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
});

app.get('/publish', function(req, res){
    res.send('Published');
    publisher.publish({
        sessionId: 1,
        foo: new Date()});
});

app.get('/pos', function(req, res){
    //res.render('pos');
    res.send('Buttons');
});

socketioserver.sockets.on('connection', function (connection) {

    publisher.publish = function (msg) {
        console.log(msg);
        //connection.send(msg.data.toString());
        socketioserver.sockets.in(msg.sessionId).send(msg.foo);
    };

//    socket.get('sessionId', function (err, name) {
//        console.log('message for ', name);
//    });

    // connection.on('set nickname', function (name) {
    var sessionId = generateUUID(); //connection.handshake.sessionID;
//    connection.set('sessionId', sessionId, function () {
    console.log('Setting sessionId: ' + sessionId);
    connection.emit('sessionId', sessionId);
    connection.send('ready');
//    });

    connection.join(sessionId);

    // });

});

app.get('/monitor', function (req, res) {
    var path = URL.parse(req.url).pathname;
        res.sendfile(__dirname + '/index.html');
});

server.listen(8083);

function generateUUID() {
    return 1;
}

