fromStream("drink-timeseries-5").whenAny( function(state,event) { 
	if(event.eventType.indexOf("5MinAgg") === 0){
		state.totalNo = state.totalNo || 0;
		state.totalgrams = state.totalgrams || 0;
		state.totallitres = state.totallitres || 0;
		state.totallethal = state.totallethal || 0;

		for (var key in event.body) {
  			if (event.body.hasOwnProperty(key)) {
    			state.totalNo = state.totalNo + key.f;
				state.totalgrams = state.totalgrams + key.g;
				state.totallitres = state.totallitres + key.litres;
				state.totallethal = state.totallethal + key.lethal;
			  }
		}
		
		state.tsdata = state.tsdata || new Array(100);		

		state.tsdata.shift();
		state.tsdata.push(event.body);
	}

	return state; 
});