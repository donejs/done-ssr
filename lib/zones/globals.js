var url = require("url");

module.exports = function(document, request, loader, steal){
	return function(data){
		var location = url.parse(request.url, true);
		document.location = location;

		return {
			document: document,
			location: location,
			globals: {
				"can.document": document,
				"doneSsr.request": request,
				"doneSsr.loader": loader,
				"steal": steal
			},

			created: function(){
				data.document = document;
				data.request = request;
			}
		};
	};
};
