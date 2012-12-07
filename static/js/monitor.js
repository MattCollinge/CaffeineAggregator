    function message(obj) {
        $('#chat').append('<p><em>' + esc(obj) + '</em></p>');
    	}

    var conn = io.connect('http://localhost:8083');
    var sessionId;
    var koModel;

    function send(){
        var val = document.getElementById('text').value;
        conn.send(val);
    }

    function setSessionID() {
        conn.emit('set nickname', 'blob');
    }

    function esc(msg){
        return msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    conn.on('purchase', function (obj) {
        message('Served ' +  obj.drink + ' at '+ obj.stamp);
        //koModel.firstName(JSON.stringify(obj));
        //updateDataSeries(JSON.stringify(obj));
    });

    conn.on('status', function (obj) {
        message(obj);
    });

    conn.on('sessionId', function(obj){
        sessionId = obj;
        message('Got sessionId from server:' + sessionId);
    });

    conn.on('dataSeries', function(data){
        console.log(data);
        rickshawData = transformData(data);
        console.log(rickshawData);
        //setupKO(rickshawData);
        renderGraph(rickshawData);
    });


    //Knockout Model
    function AppViewModel(data) {
        this.timeSeries = data;
        this.lastName = "Bertington";
        this.firstName = ko.observable("Bob").extend({logChange: "first name"});
        this.fullName = ko.computed(function() {
                                        return this.firstName() + " " + this.lastName;
                                    }, this);    
    }

    function setupKO(data){
         //Add extender to subscribe to observable
         ko.extenders.logChange = function(target, option) {
                                        target.subscribe(function(newValue) {
                                           console.log(option + ": " + newValue);
                                        });
                                        return target;
                                    };
         //Create ViewModel
         koModel = new AppViewModel(data);

         // Activates knockout.js for DOM
        //ko.applyBindings(koModel);
    }

    
var rickshawData;
   
    //Rickshaw.js - Charting
    function renderGraph(data){
        
        graph = new Rickshaw.Graph( {
                element: document.getElementById("chart"),
                renderer: 'bar',
                //width: 580,
                height: 250,
                series: data
                // series: [ {
                //         color: 'steelblue',
                //         data: data
                // }]
        } );

        var x_axis = new Rickshaw.Graph.Axis.Time( { graph: graph } );

         var y_axis = new Rickshaw.Graph.Axis.Y( {
            graph: graph,
            orientation: 'left',
            tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
            element: document.getElementById("y_axis")
        } );

        graph.render(); 

        //fluff

        var hoverDetail = new Rickshaw.Graph.HoverDetail( {
            graph: graph
        } );

        var legend = new Rickshaw.Graph.Legend( {
            graph: graph,
            element: document.getElementById('legend')

        } );

        var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
            graph: graph,
            legend: legend
        } );

        // var order = new Rickshaw.Graph.Behavior.Series.Order( {
        //     graph: graph,
        //     legend: legend
        // } );

        var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight( {
            graph: graph,
            legend: legend
        } );

        //legend.shelving = shelving;

        // add some data every so often
        // var tv = 1000;
        // setInterval( function() {
        //     var newdata = data[0].data.pop();
        //     newdata.y = newdata.y + 1;
        //     data[0].data.push(newdata);
            
        //     newdata = data[1].data.pop();
        //     newdata.y = newdata.y + 1;
        //     data[1].data.push(newdata);
            
        //     newdata = data[2].data.pop();
        //     newdata.y = newdata.y + 1;
        //     data[2].data.push(newdata);

        //     newdata = data[3].data.pop();
        //     newdata.y = newdata.y + 1;
        //     data[3].data.push(newdata);
            
        //     graph.update();
        // }, tv );
    }

    function updateDataSeries(state){
        console.log('incomming event: '+ JSON.stringify(state));

            var oldPoint = rickshawData[0].data.pop();
            var x_time = new Date(state.stamp).getTime();
            console.log(x_time);
            console.log(oldPoint.x);
            if(oldPoint.x === x_time){
                //add to exisitng
                oldPoint.y = oldPoint.y + 1;
                rickshawData[0].data.push(oldPoint);
            }
            else{
                //push back oldPoint, shift() oldest out the begining/top and push new in at end as is
                rickshawData[0].data.push(oldPoint);
                rickshawData[0].data.shift();
                rickshawData[0].data.push({ x: parseFloat(x_time), y: 1});
            } 

            oldPoint = rickshawData[1].data.pop();
            if(oldPoint.x === x_time){
                //add to exisitng
                oldPoint.y = oldPoint.y + 1;
                rickshawData[1].data.push(oldPoint);
            }
            else{
                //push back oldPoint, shift() oldest out the begining/top and push new in at end as is
                rickshawData[1].data.push(oldPoint);
                rickshawData[1].data.shift();
                rickshawData[1].data.push({ x: parseFloat(x_time), y: state.volume || 0});
            } 

            oldPoint = rickshawData[2].data.pop();
            if(oldPoint.x === x_time){
                //add to exisitng
                oldPoint.y = oldPoint.y + 1;
                rickshawData[2].data.push(oldPoint);
            }
            else{
                //push back oldPoint, shift() oldest out the begining/top and push new in at end as is
                rickshawData[2].data.push(oldPoint);
                rickshawData[2].data.shift();
                rickshawData[2].data.push({ x: parseFloat(x_time), y: state.gofcaffeine || 0});
            } 

            oldPoint = rickshawData[3].data.pop();
            if(oldPoint.x === x_time){
                //add to exisitng
                oldPoint.y = oldPoint.y + 1;
                rickshawData[3].data.push(oldPoint);
            }
            else{
                //push back oldPoint, shift() oldest out the begining/top and push new in at end as is
                rickshawData[3].data.push(oldPoint);
                rickshawData[3].data.shift();
                rickshawData[3].data.push({ x: parseFloat(x_time), y: state.lethaldoses || 0});
            } 
            
        //  Rickshaw.keys(state).forEach(function(t){
        //     var oldPoint = rickshawData[0].data.pop();
        //     var x_time = new Date(t).getTime();
        //     console.log(JSON.stringify(t));
        //     if(oldPoint.x === x_time){
        //         //add to exisitng
        //         oldPoint.y = oldPoint.y + t.f;
        //         rickshawData[0].data.push(oldPoint);
        //     }
        //     else{
        //         //push back oldPoint, shift() oldest out the begining/top and push new in at end as is
        //         rickshawData[0].data.push(oldPoint);
        //         rickshawData[0].data.shift();
        //         rickshawData[0].data.push({ x: parseFloat(x_time), y: t.f || 0});
        //     } 
        // });

    }

function transformData(d) {
    var data = [];
    var metricCounts = {};
    var palette = new Rickshaw.Color.Palette();

    console.log(JSON.stringify(d));
    
    d.forEach(function(t){
        //console.log(JSON.stringify(t));
        Rickshaw.keys(t).forEach(function(x){
            //console.log(JSON.stringify(x));
            Rickshaw.keys(t[x]).forEach( function(metric) {
                //console.log(JSON.stringify(metric));
                //console.log(JSON.stringify(t[x][metric]));
                    metricCounts[metric] = metricCounts[metric] || [];
                metricCounts[metric].push( { x: parseFloat(new Date(x).getTime()), y: t[x][metric] || 0} );
            });
        });
    } );

    Rickshaw.keys(metricCounts).sort().forEach( function(metric) {
        data.push( {
            name: metric,
            data: metricCounts[metric],
            color: palette.color()
        } );
    } );

    //console.log(JSON.stringify(data));
    Rickshaw.Series.zeroFill(data);

    return data;
}
    