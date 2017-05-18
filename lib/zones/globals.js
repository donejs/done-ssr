var url = require("url");

module.exports = function(document, request, loader, steal, modules){
	var DOCUMENT = modules.DOCUMENT || function(){};

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
				"doneSsr.loader": loader,
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
