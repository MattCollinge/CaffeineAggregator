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