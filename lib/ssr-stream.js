var makeRequest = require("./util/make_request");
var Readable = require("stream").Readable;
var util = require("util");

var Zone = require("can-zone");
var cookies = require("../zones/cookies");
var debug = require("../zones/debug");
var pushFetch = require("../zones/push-fetch");
var pushMutations = require("../zones/push-mutations");
var pushXHR = require("../zones/push-xhr");
var requests = require("../zones/requests");
var supportsIncremental = require("./util/supports_incremental");

var timeout = require("can-zone/timeout");
var TimeoutError = timeout.TimeoutError;

var doctype = "<!doctype html>";

var SafeStream = function(requestOrUrl, options){
	Readable.call(this);
	this.request = makeRequest(requestOrUrl);
	this.options = options;
	this.dests = [];
};

util.inherits(SafeStream, Readable);

SafeStream.prototype._read = function(){
	if(this._renderPromise) { return; }
	this._renderPromise = this.render();
};

SafeStream.prototype.render = function(){
	var stream = this;
	var request = this.request;
	var response = this.response;

	var zones = [
		requests(request, this.options),
		this.options.domZone(request, response)
	];

	if(this.options.steal !== false) {
		var donejs = require("../zones/donejs");
		zones.push(donejs(this.options.steal, response));
	}

	zones.push(cookies(request, response));

	var timeoutMs = this.options.timeout;
	var timeoutZone = timeout(timeoutMs);
	zones.push(timeoutZone);

	if(this.options.debug) {
		zones.push(debug(timeoutZone));
	}

	var incremental = this.options.strategy === "incremental" &&
		supportsIncremental(request);

	if(incremental) {
		zones.push(pushMutations(request, response, undefined, this.options.streamMap));
		zones.push(pushFetch(response));
		zones.push(pushXHR(response));
	}

	if(this.options.zones) {
		this.options.zones.forEach(zone => zones.push(zone));
	}

	// Make sure the `ready` process is caught, to prevent unhandledRejection
	zones.push({
		created: function(){
			if(this.data.ready) {
				this.data.ready.catch(err => {});
			}
		}
	});

	var zone = new Zone(zones);

	var runFn = this.options.fn || void 0;
	var runPromise = zone.run(runFn);

	if(incremental) {
		var donePromise = runPromise;
		var stylePromise = Promise.resolve(zone.data.initialStylesLoaded);
		runPromise = stylePromise.then(function(){
			// Send the initial HTML.
			var html = doctype + "\n" + zone.data.html;

			stream.push(html);
			stream.push(null);

			return donePromise;
		}).catch(function(err) {
			if(err instanceof TimeoutError) {
				if(zone.data.debugInfo) {
					for(let item of zone.data.debugInfo) {
						console.error(item.stack);
					}
				}
			}
			throw err;
		});
	}
	else {
		runPromise = runPromise.then(null, function(err){
			if(!(err instanceof TimeoutError)) {
				throw err;
			}
			console.error("A timeout of", timeoutMs + "ms", "was exceeded. See https://github.com/donejs/done-ssr#timeout--5000 for more information on timeouts.");
			if (stream.options.exitOnTimeout) {
				process.exit(1);
			}
			return zone.data;
		}).then(function(data){
			var html = doctype + "\n" + data.html;

			stream.push(html);
			stream.push(null);
		});
	}

	return runPromise.catch(function(error){
		stream.emit("error", error);
	});
};

SafeStream.prototype.pipe = function(dest){
	this.dests.push(dest);
	this.response = dest;
	return Readable.prototype.pipe.apply(this, arguments);
};

module.exports = SafeStream;
