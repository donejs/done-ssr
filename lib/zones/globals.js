var url = require("url");

module.exports = function(document, request, loader, steal, modules){
	var DOCUMENT = modules.DOCUMENT || function(){};

	return function(data){
		var location = url.parse(request.url, true);
		document.location = location;

		var canDocument;

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
			},
			afterTask: function(){
				DOCUMENT(canDocument);
			}
		};
	};
};
