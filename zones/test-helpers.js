var http = require("http");
var Writable = require("stream").Writable;

exports.createServer = function(port, cb){
	var server = http.createServer(cb).listen(port);

	return new Promise((resolve, reject) => {
		server.on("listening", function(){
			resolve(server);
		});
	});
};

exports.Request = class extends http.IncomingMessage {
	constructor() {
		super();
		this.url = "/";
		this.protocol = "http";
		this.get = name => "localhost:8070";
	}
};

exports.Response = class extends Writable {
	constructor(options) {
		super(options);
		this.data = {};
	}

	push(url, opts){
		var pushes = this.data.pushes || (this.data.pushes = []);
		var push = [url, opts, []];
		pushes.push(push);
		return new Writable({
			write: function(data, enc, next){
				push[2].push(data);
				next();
			}
		});
	}
};
