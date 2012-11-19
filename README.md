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
