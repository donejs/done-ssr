// Incremental rendering test helpers

var helpers = require("./helpers");
var through = require("through2");
var {Duplex, Writable} = require("stream");
var noop = Function.prototype;

function Deferred() {
	this.promise = new Promise(function(resolve, reject){
		this.resolve = resolve;
		this.reject = reject;
	}.bind(this));
}

function emptyWritable() {
	return new Writable({write(c,e,next){next();}});
}

exports.mock = function(url, expectedPushes){
	var dfd = new Deferred();

	var result = {};

	var H2Stream = class extends Duplex {
		constructor(options) {
			super(options);
		}
		// We only need this if we have a POST body
		_read() {}
		_write(val, enc, next) {
			if(!result.html) {
				result.html = "";
			}

			result.html += val;

			next();
		}

		_final(next) {
			next();
			//dfd.resolve();
		}

		pushStream(pushHeaders, cb) {
			var pushes = result.pushes || (result.pushes = []);
			var push = [pushHeaders, null, []];
			pushes.push(push);
			var PushStream = class extends Duplex {
				_read(){}
				_write(chunk, enc, next){
					push[2].push(chunk);
					next();
				}
				_final() {
					dfd.resolve();
				}
				respond(headers) {
					push[1] = headers;
				}
			}

			cb(null, new PushStream());
		}
	};

	var headers = Object.assign(Object.create(null), {
		":method": "GET",
		":authority": "localhost:8070",
		":scheme": "http",
		":path": "/",
		"accept": "text/html",
		"user-agent": helpers.ua.chrome
	});

	var stream = new H2Stream();

	return { headers, stream, result, complete: dfd.promise };
};
