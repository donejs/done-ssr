var makeWindow = require("can-vdom/make-window/make-window");
var document = makeWindow({}).document;
var he = require("he");

exports.dom = function(html){
	html = html.replace("<!doctype html>", "").trim();
	var doc = new document.constructor();
	doc.__addSerializerAndParser(document.__serializer, document.__parser);
	var div = doc.createElement("div");
	div.innerHTML = html;

	return div.firstChild;
};

exports.preventWeirdSrcDocBug = function(){
	var proto = Object.getPrototypeOf(document.createElement("div"));
	var setAttribute = proto.setAttribute;
	proto.setAttribute = function(key){
		if(key === "srcdoc") { return; }
		return setAttribute.apply(this, arguments);
	};
	exports.preventWeirdSrcDocBug = Function.prototype; // noop
};

exports.decodeSrcDoc = function(iframe){
	var raw = iframe.getAttribute("srcdoc");
	if(!raw) {
		throw new Error("No srcdoc attribute for this iframe");
	}
	var encoded = he.decode(raw, { isAttributeValue: true });
	var html = encoded.replace(/&quot;/g, '"');
	return html;
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
