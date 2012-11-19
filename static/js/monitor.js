 function message(obj) {
        $('#chat').append('<p><em>' + esc(obj) + '</em></p>');
    	}

    var conn = io.connect('http://localhost:8083');
    var sessionId;

    function send(){
        var val = document.getElementById('text').value;
        conn.send(val);
    }

    function setSessionID() {
        conn.emit('set nickname', 'blob');
    }

    function esc(msg){
        return msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    conn.on('purchase', function (obj) {
        message('Served ' +  obj.drink + ' at '+ obj.stamp);
    });

    conn.on('status', function (obj) {
        message(obj);
    });

    conn.on('sessionId', function(obj){
        sessionId = obj;
        message('Got sessionId from server:' + sessionId);
    });