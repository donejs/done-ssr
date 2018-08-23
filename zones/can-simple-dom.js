var fullUrl = require("../lib/util/full_url");
var makeWindow = require("can-vdom/make-window/make-window");
var makeDocument = require("can-vdom/make-document/make-document");
var makeHeaders = require("../lib/util/make_headers");
var once = require("once");
var URL = (require("url").URL || require("whatwg-url").URL);
var zoneRegister = require("can-zone/register");

var globalDocument = makeDocument();

module.exports = function(requestOrHeaders){
	var headers = makeHeaders(requestOrHeaders);
	return function(data){
		// Create the document
		var window = makeWindow({});
		window.window = global;
		window.URL = URL;
		window.location = window.document.location = window.window.location =
			new URL(fullUrl(headers));
		if(!window.location.protocol) {
			window.location.protocol = "http:";
		}

		if(headers["accept-language"]) {
			window.navigator.language = headers["accept-language"];
		}

		return {
			globals: window,
			created: function(){
				data.window = window;
				data.document = window.document;
				data.headers = headers;
				registerNode(window);
			},
			beforeTask: function(){
				if(global.doneSsr) {
					global.doneSsr.globalDocument = globalDocument;
				}
			},
			ended: function(){
				data.html = data.document.documentElement.outerHTML;
			}
		};
	};
};

// Calls to can-zone/register so that Node.prototype.addEventListener is wrapped.
// This only needs to happen once, ever.
var registerNode = once(function(window) {
	var oldNode = global.Node;
	global.Node = window.Node;
	zoneRegister();
	global.Node = oldNode;
});
