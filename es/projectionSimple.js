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

http://localhost:2113/projection/{projection name}/state?partition={your user stream id}

http://192.168.0.118:2113/projection/CountByEventType/state?partition=caffine-drinks

curl http://192.168.0118:2113/projection/CountByEventType/state -H "Accept: application/json" -i

from_all().when( 
    AccountCreated: function(state,event) { 
        state.Name = event.CustomerName; 
        state.Balance = 0; 
    }, 
    TransactionOccurred: function(state,event) { 
        state.Balance += event.value; 
    } 
); 

fromAll() 
fromStream(x,y,z) 
foreach(account)

from_all().when_any( 
    function(state, event) { 
        emit(‘/streams/’ + event.Type, link_to(event)); 
    } 
);

fromCategory('user').foreachStream().when({})


//=============

//The projection below would be found at (stream of events that relate to creating and updating projections): http://127.0.0.1:2113/streams/$projections-CaffineTimeSeries5M
//projection state at: http://127.0.0.1:2113/streams/$projections-CaffineTimeSeries5M-state
	//eg for state change no 43: http://127.0.0.1:2113/streams/$projections-CaffineTimeSeries5M-state/event/43?format=json
//The emitted Stream at: http://127.0.0.1:2113/streams/DrinkTimeSeries-5
	//eg for event no 3: http://127.0.0.1:2113/streams/DrinkTimeSeries-5/event/3?format=json

fromAll().when({ADrinkServed: function(state,event) { 

function GetNextPeriod(sampleDate)
{
	var periodSize = 5*60000;
	var msPastLastPeriod = sampleDate.getTime() % periodSize;

	return new Date(sampleDate.getTime() - msPastLastPeriod + periodSize);
}

 if(event.streamId.indexOf("$") != 0)
 {
	if(state)
	{
		state.count ++;
	} else {
		state = {'period': GetNextPeriod(new Date(event.body.stamp)), 'count': 1};
	}
   
	if(new Date(event.body.stamp).getTime() > new Date(state.period).getTime())
	{
		var newEvent = {'periodEnding': state.period,
				 'frequency': state.count
				};
			
		emit('DrinkTimeSeries-5', "5MinAgg", newEvent);

		state.period = GetNextPeriod(new Date(event.body.stamp));
		state.count = 0;
	}
}

	return state;
}});
                              