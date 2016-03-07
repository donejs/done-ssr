var url = require("url");

module.exports = function(document, request, loader){
	return function(data){
		return {
			document: document,
			location: url.parse(request.url, true),
			globals: {
				"can.document": document,
				"canSsr.request": request,
				"canSsr.loader": loader
			},

			created: function(){
				data.document = document;
			}
		};
	};
};
