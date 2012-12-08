var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);

var io = require('socket.io').listen(server);
var es = require('./es/es.api');

var drinks = [{id: 'coffee-large', name: 'Large Coffee'},
                {id: 'coffee-small', name: 'Small Coffee'},
                {id: 'coke', name: 'Coke'}];

var publisher = {
    publish: function(){}
};

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.static(__dirname + '/static'));
    app.use(express.bodyParser());
});

var port = 80;
server.listen(port);
console.log("Listening on port " + port);

app.post('/publish', function(req, res){
    //TODO: Calculate volume in litres, grams of caffeine & lethal does for mongooses ;)
    console.log('in publish...');
    var event = createEvent(req.ip, req.body.drink);
    storeAndPublishEvent(event);
    res.send({result:'Published'});
});

app.get('/pos', function(req, res){
    res.render('pos', { title: "POS", drinks: drinks});
});

app.get('/monitor', function(req, res){
    res.render('monitor',  { title: "Monitor"});
});

io.sockets.on('connection', function (connection) {
    publisher.publish = function (msg) {
        io.sockets.emit('purchase',msg);
    };
   connection.emit('status','ready');
   //TODO: Get Projection from Event Store here and send to Monitor over websockets
    getCaffeineDataSeries(function(timeSeries){
        connection.emit('dataSeries', timeSeries);
    });
});

function sizeByDrinkType(drink){
    var size;
    switch(drink)
    {
        case 'coffee-large': 
            size = 560;
            break;
        case 'coffee-small': 
            size = 340;
            break;
        case 'coke':
            size = 500;
            break;
        default:
            size = 0;
    }
    return size/1000;
}

function gramsOfCaffeine(size, drink){
    var g;
    switch(drink)
    {
        case 'coffee-large': 
            g = 157 * 3;
            break;
        case 'coffee-small': 
            g = 157 * 2;
            break;
        case 'coke':
            g = 96 * size;
            break;
        default:
            g = 0;
    }
    return g;
}

function leathalDoses(g){
    //80-150mg per kg. Mongoose weighes ~ 280g
    lethalDoseForMongoose = 80 * 0.28;
    return g / lethalDoseForMongoose;
}

function createEvent(ip, drink){

   var size = sizeByDrinkType(drink);
   var g = gramsOfCaffeine(size, drink);
   var l = leathalDoses(g);

   var event = {
        sender: ip,
        volume: size,
        gofcaffeine: g,
        lethaldoses: l,
        stamp: new Date(),
        drink: drink
    }
    return event;
}

function storeAndPublishEvent(event) {
    console.log("pushingEventIntoStore");

    es.postEvent({
        data: event,
        stream: "caffine-drinks",
        eventType: "ADrinkServed",
        metaData: {},//"$maxAge": 3600},
        success: function () {
            console.log("publishing event");
            //TODO: future: get new projection state and send to monitors over websockets...
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

function getCaffeineDataSeries(callback){
   // return [ { x: 0, y: 40 }, { x: 1, y: 49 }, { x: 2, y: 87 }, { x: 3, y: 42 } ];
   
 // return {"1": {"f":123, "litres":1.23, "g":3.4, "lethal":2},
 //   "2": {"f":45, "litres":0.23, "g":0.4, "lethal":0.5},
 //   "3": {"f":367, "litres":4.23, "g":13.4, "lethal":8}};
 var path = 'http://ec2-46-137-34-123.eu-west-1.compute.amazonaws.com:2113/streams/$projections-drink-5mins-agg-state?format=json';
 //http://127.0.0.1:2113/streams/$projections-drink-5mins-agg-state
 var getProjectionState = function (res) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    res.on('data', function (chunk) {
        str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    res.on('end', function () {
        var projection = JSON.parse(str);
        var projStateUri = '';
        
        console.log(JSON.stringify(projection.entries[0].links));
            
        projection.entries[0].links.forEach(function(link){ 
            console.log(JSON.stringify(link));
            if(link.type === 'application/json'){
                projStateUri = link.uri;
            }
        });
        getProjectionData(projStateUri, function(res){
            var str = '';
            res.on('data', function (chunk) {
                str += chunk;
            });
            res.on('end', function () {
                var projectionState = JSON.parse(str);
                callback(projectionState.data);
            });
        });
    });
    
 }

 getProjectionData(path, getProjectionState);

}

function getProjectionData(uri, onSuccess){
 
    var req = http.request(uri, function(res)
    {
        console.log("STATUS: " + res.statusCode);
        if(res.statusCode === 200)
            onSuccess(res);
        else
            console.log("Status Code: " + res.statusCode);
    });

    req.on("error", function (error) 
    {
        console.log("Error occured: " + error + ', uri: ' + uri);
    });

    req.setSocketKeepAlive();
    req.end();
    console.log("Requested Projection from EventStore: " + uri);

}

