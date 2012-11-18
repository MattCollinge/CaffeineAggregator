var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);

var io = require('socket.io').listen(server);
var es = require('./es/es.api');

var drinks = [{ id: 'coffee'}, {id: 'coke'}];

var publisher = {
    publish: function(){}
};

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.static(__dirname + '/static'));
    app.use(express.bodyParser());
});

app.post('/publish', function(req, res){
    res.send({result:'Published'});
    var event = {
        sender: req.ip,
        sessionId: 1,
        stamp: new Date(),
        drink: req.body.drink
    }
    storeAndPublishEvent(event);
});

app.get('/pos', function(req, res){
    res.render('pos', { title: "POS", drinks: drinks});
});

io.sockets.on('connection', function (connection) {

    publisher.publish = function (msg) {
        //connection.send(msg);
        io.sockets.in(msg.sessionId).emit('purchase',msg);
    };
    var sessionId = generateUUID(); 
    console.log('Setting sessionId: ' + sessionId);
    connection.emit('sessionId', sessionId);
    connection.emit('status','ready');
    connection.join(sessionId);

});

app.get('/monitor', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

var port = 8083;
server.listen(port);
console.log("Listening on port " + port);

function generateUUID() {
    return 1;
}

function storeAndPublishEvent(event) {
    console.log("pushingEventIntoStore");

    es.postEvent({
        data: event,
        stream: "caffine-drinks",
        eventType: "DrinkPurchased",
        success: function () {
            console.log("publishing event");
            publisher.publish(event);
        },
        error: function(error, eventId, correlationId, expectedVersion){
                console.log("Error occurred");
                publisher.publish({
                    sessionId: "IHaveNotPublishedAnEvent",
                    foo: error + " " + eventId + " " + correlationId + " " +expectedVersion
                });
        }
    });
}
