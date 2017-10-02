var assert = require("assert");
var xhrZone = require("can-zone/xhr");

module.exports = function(data){
	return {
		plugins: [xhrZone],

		// Attach the xhr content to the end of the body
		ended: function(){
			var doc = data.document;
			assert(doc, "done-ssr/zones/requests/xhr-cache requests a document.");

			var body = doc.body.getElementsByTagName("body")[0] || doc.body;
			if(data.xhr) {
				var xhrScript = doc.createElement("script");
				var xhrTN = doc.createTextNode(data.xhr.toString());
				xhrScript.appendChild(xhrTN);
				body.insertBefore(xhrScript, body.lastChild);
			}
		}
	}
}
