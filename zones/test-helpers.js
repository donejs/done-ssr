var http = require("http");
var {Duplex, Writable} = require("stream");

exports.createServer = function(port, cb){
	var server = http.createServer(cb).listen(port);

	return new Promise((resolve, reject) => {
		server.on("listening", function(){
			resolve(server);
		});
	});
};

exports.Request = class extends http.IncomingMessage {
	constructor(url) {
		super();
		this.url = url || "/";
		this.protocol = "http";
		this.connection = {};
		this.headers = {host:"localhost"};
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

exports.h2Headers = function() {
	return Object.assign(Object.create(null), {
		":method": "GET",
		":authority": "localhost:8070",
		":scheme": "http",
		":path": "/",
		"accept": "text/html"
	});
};

exports.H2Stream = class extends Duplex {
	constructor(options) {
		super(options);

		this.data = {};
		this.pushAllowed = true;
	}
	// We only need this if we have a POST body
	_read() {}
	_write() {}

	pushStream(pushHeaders, cb) {
		var pushes = this.data.pushes || (this.data.pushes = []);
		var push = [pushHeaders, null, []];
		pushes.push(push);
		var PushStream = class extends Duplex {
			_read(){}
			_write(chunk, enc, next){
				push[2].push(chunk);
				next();
			}
			respond(headers) {
				push[1] = headers;
			}
		}

		cb(null, new PushStream());
	}
};
