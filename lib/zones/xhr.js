var xhrZone = require("can-zone/xhr");

module.exports = function(data){

	return {
		plugins: [xhrZone],

		// Attach the xhr content to the end of the body
		ended: function(){
			var doc = data.document;

			var body = doc.body.getElementsByTagName("body")[0] || doc.body;
			if(data.xhr) {
				var xhrScript = doc.createElement("script");
				var xhrTN = doc.createTextNode(data.xhr.toString());
				xhrScript.appendChild(xhrTN);
				body.insertBefore(xhrScript, body.lastChild);
			}
		}
	};
};
