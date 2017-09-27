var makeWindow = require("can-vdom/make-window/make-window");
var url = require("url");

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

		return {
			globals: window,
			created: function(){
				data.document = window.document;
				data.request = request;
			},
			ended: function(){
				data.html = data.document.documentElement.outerHTML;
			}
		};
	};
};
