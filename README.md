CaffeineAggregator
==================

Fun real-time app to show the amount of caffine consumed at an event and to showcase the use of some intersting technologies

Temp set up instructions:

1) Download Event Store from [Downloads](https://github.com/EventStore/EventStore/downloads)

Latest build at time of writing: [Latest build](https://github.com/downloads/EventStore/EventStore/eventstore..9.2.win.debug.x86.zip)

2) Unzip, navigate to bin folder and fire up _EventStore.SingleNode.exe_

3) Navigate to http://localhost:2113/

4) Click on ***New projection***

5) Enter _CountByEventType_ for the Name and this code in the source input:

    fromAll().foreachStream().whenAny(function(state,event) {
	    //filter out system streams
	    if(event.streamId.indexOf("$") != 0)
	    {
	    	var type = event.eventType;
		    //probably dont want to log types like $stream-created
		    if(type.indexOf("$") != 0)
		    {
			    if(state[type])
			    {
			    	state[type]++;
			    } else {
			    	state[type] = 1;
			    }
		    }
	    }

	    return state;
    });


6) Fire up Node, order some drinks then go to: http://localhost:2113/projection/CountByEventType/state?partition=caffine-drinks and see how many drinks have been ordered...


curl -i -X POST --data-binary @./es/projections/drink-create-5min-stream.js http://127.0.0.1:2113/projections/persistent?name=drink-5mins&type=native:EventStore.Projections.Core.Standard.IndexStreams

drink-5mins projections state can then be found here:
http://127.0.0.1:2113/streams/$projections-drink-5mins-state?format=json
latest eg: http://127.0.0.1:2113/streams/$projections-drink-5mins-state/event/7?format=json

drink-timeseries-5 stream of emitted 5 min aggregates of events can be found here:
http://127.0.0.1:2113/streams/drink-timeseries-5/event/6?format=json

curl -i -X POST --data-binary @./es/projections/drink-agg-5min-stream.js http://127.0.0.1:2113/projections/persistent?name=drink-5mins-agg&type=native:EventStore.Projections.Core.Standard.IndexStreams

drink-5mins-agg projections state can then be found here:
http://127.0.0.1:2113/streams/$projections-drink-5mins-agg-state?format=json
latest eg: http://127.0.0.1:2113/streams/$projections-drink-5mins-agg-state/event/7?format=json

On cloud:

http://ec2-46-137-34-123.eu-west-1.compute.amazonaws.com/

curl -i -X POST --data-binary @./es/projections/drink-create-5min-stream.js http://ec2-46-137-34-123.eu-west-1.compute.amazonaws.com:2113/projections/persistent?name=drink-5mins&type=native:EventStore.Projections.Core.Standard.IndexStreams

curl -i -X POST --data-binary @./es/projections/drink-agg-5min-stream.js http://ec2-46-137-34-123.eu-west-1.compute.amazonaws.com:2113/projections/persistent?name=drink-5mins-agg&type=native:EventStore.Projections.Core.Standard.IndexStreams
