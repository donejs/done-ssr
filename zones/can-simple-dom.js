var makeWindow = require("can-vdom/make-window/make-window");
var makeDocument = require("can-vdom/make-document/make-document");
var once = require("once");
var url = require("url");
var zoneRegister = require("can-zone/register");

var globalDocument = makeDocument();

module.exports = function(request){
	return function(data){
		// Create the document
		var window = makeWindow({});
		window.window = Object.assign({}, global, window);
		window.location = window.document.location = window.window.location =
		 url.parse(request.url, true);
		if(!window.location.protocol) {
			window.location.protocol = "http:";
		}

		if(request.headers && request.headers["accept-language"]) {
			window.navigator.language = request.headers["accept-language"];
		}

		return {
			globals: window,
			created: function(){
				data.window = window;
				data.document = window.document;
				data.request = request;
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
