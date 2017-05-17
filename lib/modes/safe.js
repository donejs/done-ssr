var makeRequest = require("../util/make_request");
var Readable = require("stream").Readable;
var util = require("util");

var SafeStream = function(requestOrUrl){
	Readable.call(this);
	this.request = makeRequest(requestOrUrl);
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

	return startup.then(function(modules){
		var main = modules.main;
		var can = modules.can;
		var DOCUMENT = modules.DOCUMENT;
		var domMutate = modules.domMutate;

		// Save whether this is a can project or not.
		if(isACanProject === undefined) {
			isACanProject = !!can;
		}

		// Create the document
		var doc = new document.constructor();

		addCookies(doc, request);

		var serializeFromBody = !!(main.renderAsync ||
								   main.serializeFromBody);
		if(!serializeFromBody) {
			doc.head = doc.createElement("head");
			doc.documentElement.insertBefore(doc.head, doc.body);
		}

		// Create a renderer function that when calls will
		// render into a virtual DOM.
		var render = makeRender(main, can);

		var zonePlugins = [
			ssrGlobalsZone(doc, request, loader, steal, modules),
			canRouteDataZone(can),
			assetsZone(doc, bundleHelpers, can),
			responseZone(stream)
		];

		if(typeof XMLHttpRequest !== "undefined") {
			zonePlugins.push(xhrZone(options));
		}

		if(options.html5shiv) {
			zonePlugins.push(html5shivZone(can));
		}

		var timeoutZone = timeout(options.timeout);
		zonePlugins.push(timeoutZone);

		if(options.debug) {
			var debugZone = debug(doc, timeoutZone);
			zonePlugins.push(debugZone);
		}

		var zone = new Zone({
			plugins: zonePlugins
		});

		return zone.run(function(){
			render(request);

			if(isACanProject && can.route) {
				zone.data.viewModel = can.route.data;
			}
		}).then(null, function(err){
			if(!(err instanceof TimeoutError)) {
				throw err;
			}
		}).then(function(data){
			var html;
			if(serializeFromBody) {
				html = doc.body.innerHTML;
			} else {
				html = doc.documentElement.outerHTML;
			}

			var dt = cfg.doctype || doctype;
			html = dt + "\n" + html;

			//stream.push(html);
			stream.push(null);
		}, function(error){
			stream.emit("error", error);
		}).then(function(){
			cleanupDocument(doc, DOCUMENT, domMutate);
		});
	}, function(error){
		stream.emit("error", error);
	});
};

SSRStream.prototype.pipe = function(dest){
	this.dests.push(dest);
	return Readable.prototype.pipe.apply(this, arguments);
};
