var WebSocketClient = require('websocket').client;
var EventEmitter = require("events");

var MyWebSocket = global.WebSocket = function(address){
	this.address = address;
	this.emitter = new EventEmitter();

	// Create the connection here
	this.client = new WebSocketClient();

	var ws = this;
	this.client.on('connect', function(connection){
		ws.connection = connection;

		ws.connection.on("message", function(data){
			var msg = data.utf8Data;
			var msgObject = {
				data: msg
			};
			if(ws.onmessage) {
				ws.onmessage(msgObject);
			}
			ws.emitter.emit("message", msgObject);
		});

		if(ws.onopen) {
			ws.onopen();
		}
	});
	this.client.connect(this.address);
};

MyWebSocket.prototype.addEventListener = function(event, cb){
	this.emitter.on(event, cb);
};
MyWebSocket.prototype.removeEventListener = function(event, cb){
	this.emitter.removeListener(event, cb);
};

MyWebSocket.prototype.send = function(msg){
	this.connection.send(msg);
};
