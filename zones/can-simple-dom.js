var makeWindow = require("can-vdom/make-window/make-window");
var url = require("url");

module.exports = function(request){
	return function(data){
		// Create the document
		var window = makeWindow({});
		window.location = window.document.location = url.parse(request.url, true);

		return {
			globals: window,
			created: function(){
				data.document = window.document;
			},
			ended: function(){
				data.html = data.document.documentElement.outerHTML;
			}
		};
	};
};
