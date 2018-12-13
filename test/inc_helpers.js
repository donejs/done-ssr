// Incremental rendering test helpers

var helpers = require("./helpers");
var {Duplex} = require("stream");

function Deferred() {
	this.promise = new Promise(function(resolve, reject){
		this.resolve = resolve;
		this.reject = reject;
	}.bind(this));
}

exports.mock = function(url, expectedPushes){
	var dfd = new Deferred();

	var result = {};

	var H2Stream = class extends Duplex {
		constructor(options) {
			super(options);
			this.pushAllowed = true;
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
			};

			cb(null, new PushStream());
		}
	};

	var headers = Object.assign(Object.create(null), {
		":method": "GET",
		":authority": "localhost:8070",
		":scheme": "http",
		":path": url,
		"accept": "text/html",
		"user-agent": helpers.ua.chrome
	});

	var stream = new H2Stream();

	return { headers, stream, result, complete: dfd.promise };
};
