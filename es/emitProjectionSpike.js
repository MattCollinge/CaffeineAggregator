 
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
	return new Date(sampleDate.getTime() + 5*60000);
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
	if(event.stamp > state.period)
	{
		emit('/streams/TimeSeries1', 
			{
				TimeBucket: state.period,
				Count: state.count
			});

			state.period = GetNextPeriod(event.stamp);
			state.count = 0;
	}
	return state; 
}