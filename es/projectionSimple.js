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