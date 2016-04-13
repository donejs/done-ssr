var url = require("url");

module.exports = function(dom, request, loader){
	var document = dom.document;

	return function(data){
		var globals = {
			"can.document": document,
			"doneSsr.request": request,
			"doneSsr.loader": loader
		};

		if(dom.window) {
			globals.window = dom.window;
		}
		if(dom.XMLHttpRequest) {
			globals.XMLHttpRequest = dom.XMLHttpRequest;
		}

		return {
			document: document,
			location: url.parse(request.url, true),
			globals: globals,

			created: function(){
				data.document = document;
				data.request = request;
			}
		};
	};
};
