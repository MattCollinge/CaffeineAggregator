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

var port = 8083;
server.listen(port);
console.log("Listening on port " + port);

app.post('/publish', function(req, res){
    var event = {
        sender: req.ip,
        sessionId: 1,
        stamp: new Date(),
        drink: req.body.drink
    }
    storeAndPublishEvent(event);
    res.send({result:'Published'});
});

app.get('/pos', function(req, res){
    res.render('pos', { title: "POS", drinks: drinks});
});


var projection = require('./es/emitProjectionSpike');
var stream = [{location: '/streams/TimeSeries1', 
        event: {
            TimeBucket: new Date(),
            Count: 1
            }}];

app.get('/monitor', function(req, res){
    res.render('monitor',  { title: "Monitor", stream: projection.tryEmit()});
});


app.get('/project', function(req, res){
    res.render('monitor', { title: "Monitor", stream: stream});
    //stream: projection.tryEmit()});
});

io.sockets.on('connection', function (connection) {
    publisher.publish = function (msg) {
        io.sockets.emit('purchase',msg);
    };
   connection.emit('status','ready');
});

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
