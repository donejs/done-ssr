// Incremental rendering test helpers

var helpers = require("./helpers");
var through = require("through2");
var noop = Function.prototype;
var Writable = require("stream").Writable;

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

	var result = {
		html: null,
		instructions: []
	};

	var request = {
		url: "/orders",
		method: "GET",
		connection: {},
		headers: {
			"host": "localhost",
			"user-agent": helpers.ua.chrome
		},
		get: function(name) {
			return this.headers[name.toLowerCase()];
		}
	};

	var response = through(function(buffer, enc, done){
		result.html = buffer.toString();
	});
	response.writeHead = noop;

	function instructions() {
		return new Writable({
			write(chunk, enc, next) {
				//var json = chunk.toString();
				//var instrs = JSON.parse(json);
				result.instructions.push(chunk);
				next();
			}
		});
	}

	var pushes = expectedPushes;
	response.push = function(url){
		pushes--;
		if(pushes === 0) {
			setTimeout(dfd.resolve, 20);
		}
		if(/donessr_instructions/.test(url)) {
			return instructions();
		} else if(url === "http://localhost:8070/bar") {
			return emptyWritable();
		}
	};

	return { request, response, result, complete: dfd.promise };
};
