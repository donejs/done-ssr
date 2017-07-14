var url = require("url");

module.exports = function(document, stream, steal, modules){
	var DOCUMENT = modules.DOCUMENT || function(){};
	var loader = steal.loader;
	var request = stream.request;
	var pushResources = stream[Symbol.for("donessr.incremental")];

	return function(data){
		var location = url.parse(request.url, true);
		document.location = location;

		var canDocument, language,
		getHeader = function(name) {
			if(request.headers) {
				return request.headers[name];
			}
		};

		return {
			document: document,
			location: location,
			globals: {
				"doneSsr.request": request,
				"doneSsr.responses": stream.dests,
				"doneSsr.loader": loader,
				"doneSsr.pushResources": pushResources,
				"steal": steal
			},

			created: function(){
				data.document = document;
				data.request = request;
			},
			beforeTask: function(){
				canDocument = DOCUMENT();
				DOCUMENT(document);

				language = navigator.language;
				var lang = getHeader("accept-language");
				if(lang) {
					navigator.language = lang;
				}
			},
			afterTask: function(){
				DOCUMENT(canDocument);
				navigator.language = language;
			}
		};
	};
};
