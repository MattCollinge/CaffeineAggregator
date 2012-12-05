fromAll().when({ADrinkServed: function(state,event) { 

function GetNextPeriod(sampleDate)
{
	var periodSize = 5*60000;
	var msPastLastPeriod = sampleDate.getTime() % periodSize;

	return new Date(sampleDate.getTime() - msPastLastPeriod + periodSize);
}

function resetState(eventDate){
	return {
		'period': GetNextPeriod(new Date(eventDate)),
		'count': 1, 
		'volume': 0.0, 
		'gofcaffeine': 0.0, 
		'lethaldoses': 0.0
		};
}

 if(event.streamId.indexOf("$") != 0)
 {
	state.period = state.period || GetNextPeriod(new Date(event.body.stamp));

	state.count ++;
	state.volume = state.volume + event.body.volume || event.body.volume;
	state.gofcaffeine = state.gofcaffeine + event.body.gofcaffeine || event.body.gofcaffeine;
	state.lethaldoses = state.lethaldoses + event.body.lethaldoses || event.body.lethaldoses;
	//TODO: account by drink type...
   
	if(new Date(event.body.stamp).getTime() > new Date(state.period).getTime()){
		var newEvent = {};
		newEvent[state.period] ={
		 	'f': state.count,
		 	'litres': state.volume,
		 	'g': state.gofcaffeine,
		 	'lethal': state.lethaldoses
		 	};			
		emit('drink-timeseries-5', "5MinAgg", newEvent);
		state = resetState(event.body.stamp);
	}
}

	return state;
}});