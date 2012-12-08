fromStream("drink-timeseries-5").whenAny( function(state,event) { 
	log('Im running an event from drink-time-series-5');
	
	function genArray()
	{
		var lastStamp = new Date();
		var arr = [];
		var blank = {};
		for(i=0;i<100;i++)
		{
			lastStamp = getTimeStamp(lastStamp);

			blank[lastStamp] ={
		 	'f': 0,
		 	'litres': 0,
		 	'g': 0,
		 	'lethal': 0
		 	};			

			arr.unshift(blank);
			blank = {};
		}
		return arr;
	}

	function getTimeStamp(lastStamp){
		var periodSize = 5*60000;
		var msPastLastPeriod = lastStamp.getTime() % periodSize;

		return new Date(lastStamp.getTime() - msPastLastPeriod - periodSize);

	}


	if(event.eventType.indexOf("5MinAgg") === 0){
		for (var key in event.body) {
  			if (event.body.hasOwnProperty(key)) {
  				log('5MinAgg Event key:' + JSON.stringify(event.body[key]));
    			state.totalNo = state.totalNo + event.body[key].f || 0;
				state.totalgrams = state.totalgrams + event.body[key].g || 0;
				state.totallitres = state.totallitres + event.body[key].litres || 0;
				state.totallethal = state.totallethal + event.body[key].lethal || 0;
			  }
		}

		log('Im am just updating tseries from drink-time-series-5');
	
		state.tsdata = state.tsdata || genArray();		

		log('Im have just updating tseries from drink-time-series-5');
	
		state.tsdata.shift();
		state.tsdata.push(event.body);
	}

	return state; 
});