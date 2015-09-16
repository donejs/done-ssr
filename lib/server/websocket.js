var WebSocketClient = require('websocket').client;

var MyWebSocket = global.WebSocket = function(address){
	this.address = address;

	// Create the connection here
	this.client = new WebSocketClient();

	var ws = this;
	this.client.on('connect', function(connection){
		ws.connection = connection;

		ws.connection.on("message", function(data){
			var msg = data.utf8Data;
			if(ws.onmessage) {
				ws.onmessage({
					data: msg
				});
			}
		});

		if(ws.onopen) {
			ws.onopen();
		}
	});
	this.client.connect(this.address);
};

MyWebSocket.prototype.send = function(msg){
	this.connection.send(msg);
};
