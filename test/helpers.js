
exports.dom = function(html){
	html = html.replace("<!DOCTYPE html>", "").trim();
	var doc = new document.constructor();
	doc.__addSerializerAndParser(document.__serializer, document.__parser);
	var div = doc.createElement("div");
	div.innerHTML = html;

	return div.firstChild;
};

exports.traverse = function(node, callback){
	var cur = node.firstChild;

	while(cur) {
		callback(cur);
		exports.traverse(cur, callback);
		cur = cur.nextSibling;
	}
};

exports.find = function(node, callback){
	var out;
	exports.traverse(node, function(el){
		if(callback(el)) {
			out = el;
		}
	});
	return out;
};

exports.text = function(node){
	var txt = "";
	exports.traverse(node, function(el){
		if(el.nodeType === 3) {
			txt += el.nodeValue;
		}
	});
	return txt;
};

exports.getXhrCache = function(node){
	var script = exports.find(node, function(el){
		if(el.tagName !== "SCRIPT") { return false; }

		var txt = exports.text(el);
		return /XHR_CACHE/.test(txt);
	});

	var txt = exports.text(script).replace(/XHR_CACHE = /, "");
	var cache = JSON.parse(
		txt.substr(0, txt.length - 1)
	);

	return cache;
};

exports.getInlineCache = function(node){
	var script = exports.text(exports.find(node, function(el){
		return el.getAttribute && el.getAttribute("asset-id") === "@inline-cache";
	})).trim().replace(/INLINE_CACHE = /, "");
	var cache = JSON.parse(
		script.substr(0, script.length - 1)
	);
	return cache;
};

exports.count = function(node, callback){
	var count = 0;
	exports.traverse(node, function(){
		var truthy = callback.apply(this, arguments);
		if(truthy) {
			count++;
		}
	});
	return count;
};

// A good enough XHR object
exports.mockXHR = function(responseFN, options){
	options = options || {};
	if(typeof responseFN === "string") {
		var responseText = responseFN;
		responseFN = function(){
			return responseText;
		};
	}
	var XHR = function(){
		this.onload = null;
		this.__events = {};
		this.__headers = {};
	};
	var realSetTimeout = global.setTimeout;
	XHR.prototype.addEventListener = function(ev, fn){
		var evs = this.__events[ev] = this.__events[ev] || [];
		evs.push(fn);
	};
	XHR.prototype.setRequestHeader = function(name, value){
		this.__headers[name] = value;
	};
	XHR.prototype.getRequestHeader = function(name){
		return this.__headers[name];
	};
	XHR.prototype.getResponseHeader = function(){};
	XHR.prototype.open = function(){};
	XHR.prototype.send = function(){
		var onload = this.onload;
		var onerror = this.onerror;
		var xhr = this;
		realSetTimeout(function(){
			if(options.error) {
				callEvents(xhr, "error");
				if(onerror) {
					onerror({ target: xhr });
				}
				return;
			}

			xhr.responseText = responseFN();
			onload({ target: xhr });
			callEvents(xhr, "load");
		}, 40);
		if (options.beforeSend) {
			options.beforeSend(this);
		}
	};
	function callEvents(xhr, ev) {
		var evs = xhr.__events[ev] || [];
		evs.forEach(function(fn){
			fn.call(xhr);
		});
	}
	XHR.prototype.setDisableHeaderCheck = function(){};
	XHR.prototype.getAllResponseHeaders = function(){
		return "Content-Type: application/json";
	};
	return XHR;
};
