fromAll().when({ADrinkServed: function(state,event) { 

	function GetNextPeriod(sampleDate)
	{
		var periodSize = 5*60000;
		var msPastLastPeriod = sampleDate.getTime() % periodSize;

		return new Date(sampleDate.getTime() - msPastLastPeriod + periodSize);
	}

	 if(event.streamId.indexOf("$") != 0)
	 {
		var thisPeriod = GetNextPeriod(new Date(event.body.stamp));

		if(!state.series)
		{
			state.series = {};
		}

			if(state.series[thisPeriod])
			{
				log("Found Period");
				state.series[thisPeriod].count ++;
			} else {
				log("Didn't find Period");
				state.series[thisPeriod] = {'period': thisPeriod, 'count': 1};
			}
	   }
		return state;
}});