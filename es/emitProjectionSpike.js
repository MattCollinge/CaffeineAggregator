 
exports.tryEmit = function(){
var outputStream = [];
var state;

function GetNextEvent(lastDate)
{
	var diff = 1;
	var newDate = new Date(lastDate.getTime() + diff*60000);

	return {
		sender: '192.168.0.1',
        sessionId: 1,
        stamp: newDate,
        drink: 'Coffee'
		};
}

function GetEventStream(eventCount)
{
	var event, myEvents = [], 
	lastDate = new Date();
	for (var i = 0; i < eventCount; i++) {
		event = GetNextEvent(lastDate);
		myEvents.push(event);
		lastDate = event.stamp;
	};
	return myEvents;	
}

var myEvents = GetEventStream(20);

for (var i = 0; i < myEvents.length; i++) {
	state = project(state, myEvents[i], emit);
};
 
function emit(loc, event)
{
	outputStream.push({location: loc, event: event});
}

return outputStream;
}



function GetNextPeriod(sampleDate)
{
	var periodSize = 5*60000;
	var msPastLastPeriod = sampleDate.getTime() % periodSize;

	return new Date(sampleDate.getTime() - msPastLastPeriod + periodSize);
}

var project = function(state,event, emit){ 
 
// if(event.streamId.indexOf("$") != 0)
// 	{
// 		if(type.indexOf("$") != 0)
// 		{
			if(state)
			{
				state.count ++;
			} else {
				state = {period: GetNextPeriod(event.stamp), count: 1};
			}
	// 	}
	// }
	if(event.stamp.getTime() > state.period.getTime())
	{
		emit('/streams/TimeSeries1', 
			{
				PeriodEnding: state.period,
				Count: state.count
			});

			state.period = GetNextPeriod(event.stamp);
			state.count = 0;
	}
	return state; 
}



//ES Projection:::
/*
fromAll().when({DrinkServed: function(state,event) { 

function GetNextPeriod(sampleDate)
{
	var periodSize = 5*60000;
	var msPastLastPeriod = sampleDate.getTime() % periodSize;

	return new Date(sampleDate.getTime() - msPastLastPeriod + periodSize);
}

 if(event.streamId.indexOf("$") != 0)
 	{
log(JSON.stringify(event));
if(state)
			{
				state.count ++;
			} else {
   			state = {period: GetNextPeriod(new Date(event.body.stamp)), count: 1};
			}
   
	if(new Date(event.body.stamp).getTime() > new Date(state.period).getTime())
	{
		emit('/streams/CaffineTimeSeries5M', 
			{
				PeriodEnding: state.period,
				Count: state.count
			});

			state.period = GetNextPeriod(new Date(event.body.stamp));
			state.count = 0;
	}
}

	return state;
}});


//=====

fromAll().when({DrinkServed: function(state,event) { 

function GetNextPeriod(sampleDate)
{
	var periodSize = 5*60000;
	var msPastLastPeriod = sampleDate.getTime() % periodSize;

	return new Date(sampleDate.getTime() - msPastLastPeriod + periodSize);
}

 if(event.streamId.indexOf("$") != 0)
 	{
log(JSON.stringify(event));
if(state)
			{
				state.count ++;
			} else {
   			state = {period: GetNextPeriod(new Date(event.body.stamp)), count: 1};
			}
   
	if(new Date(event.body.stamp).getTime() > new Date(state.period).getTime())
	{
		linkTo('CaffineTimeSeries-5Min', 
			{
				periodEnding: state.period,
				frequency: state.count
			});

			state.period = GetNextPeriod(new Date(event.body.stamp));
			state.count = 0;
	}
}

	return state;
}});

fromStream("DrinkTimeSeries-5").when( function(state,event) { 
	if(event.eventType.indexOf("5MinAgg") != 0)
	{
		if(state.data){
			state.data.push(
				{"periodEnding": event.periodEnding,
				"frequency": event.frequency
				});
		}
		else
		{ 
			state.data = [];
			state.data.push(
				{"periodEnding": event.periodEnding,
				"frequency": event.frequency
				});
		}
	}
	return state; 
});


//All in one projection...

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
*/
                    