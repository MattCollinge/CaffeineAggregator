    var attendeeCount = 19;
    var conn = io.connect('ec2-46-137-34-123.eu-west-1.compute.amazonaws.com');
    var sessionId;
    var koModel;
    var rickshawData;

    conn.on('purchase', function (obj) {
        updateDataSeries(obj);
    });

    conn.on('dataSeries', function(data){
        //console.log(JSON.stringify(data));
        rickshawData = transformData(data.tsdata);
        console.log(rickshawData);
        setupKO(data);
        renderGraph(rickshawData);
    });


    //Knockout Model
    function AppViewModel(data) {
        this.timeSeries = data.tsdata;
        this.drinks = ko.observable(data.totalNo);
        this.mg = ko.observable(data.totalgrams.toFixed(0));
        this.litres = ko.observable(data.totallitres.toFixed(2));
        this.lethal = ko.observable(data.totallethal.toFixed(2));
        this.mgPerAttendee = ko.computed(function() {
                                        return (this.mg() / attendeeCount).toFixed(2);
                                    }, this);

        this.drinksPerAttendee = ko.computed(function() {
                                        return (this.drinks() / attendeeCount).toFixed(2);
                                    }, this);

        // this.firstName = ko.observable("Bob").extend({logChange: "first name"});
        // this.fullName = ko.computed(function() {
        //                                 return this.firstName() + " " + this.lastName;
        //                             }, this);    
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
        ko.applyBindings(koModel);
    }
   
    //Rickshaw.js - Charting
    function renderGraph(data){
        
        graph = new Rickshaw.Graph( {
                element: document.getElementById("chart"),
                renderer: 'bar',
                width: 580,
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

        // var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight( {
        //     graph: graph,
        //     legend: legend
        // } );
    }

    function getTimeStamp(lastStamp){
        var periodSize = 5*60000;
        var msPastLastPeriod = lastStamp.getTime() % periodSize;

        return new Date(lastStamp.getTime() - msPastLastPeriod + periodSize);

    }

    function updateMetric(seriesIndex, x, delta_y)
    {
            var oldPoint = rickshawData[seriesIndex].data.pop();
            if(oldPoint.x === x){
                rickshawData[seriesIndex].data.push({ x: x, y: oldPoint.y + delta_y});
            }
            else{
                rickshawData[seriesIndex].data.push({x: oldPoint.x, y: oldPoint.y});
                rickshawData[seriesIndex].data.shift();
                rickshawData[seriesIndex].data.push({ x: x, y: delta_y});
            }
            
    }

    function updateDataSeries(state){
        console.log('incomming event: '+ JSON.stringify(state));
        //console.log('incomming event: '+ JSON.parse(state).stamp);

            var x_time = getTimeStamp(new Date(state.stamp)).getTime()/1000;
            console.log(x_time);
            
            updateMetric(0, x_time, 1);
            updateMetric(1, x_time, state.gofcaffeine);
            updateMetric(2, x_time, state.lethaldoses);
            updateMetric(3, x_time, state.volume);
 

            graph.update();

            koModel.drinks(koModel.drinks() + 1);
            koModel.mg((new Number(koModel.mg()) + state.gofcaffeine).toFixed(0));
            koModel.litres((new Number(koModel.litres()) + state.volume).toFixed(2));
            koModel.lethal((new Number(koModel.lethal())+ state.lethaldoses).toFixed(2));
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
    var palette = new Rickshaw.Color.Palette('munin');

    console.log(JSON.stringify(d));
    
    d.forEach(function(t){
        //console.log(JSON.stringify(t));
        Rickshaw.keys(t).forEach(function(x){
            //console.log(JSON.stringify(x));
            Rickshaw.keys(t[x]).forEach( function(metric) {
                //console.log(JSON.stringify(metric));
                //console.log(JSON.stringify(t[x][metric]));
                    metricCounts[metric] = metricCounts[metric] || [];
                metricCounts[metric].push( { x: new Date(x).getTime()/1000, y: t[x][metric] || 0} );
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

    console.log(JSON.stringify(data));
    //Rickshaw.Series.zeroFill(data);

    return data;
}
    