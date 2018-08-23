var url = require("url");
var fullUrlExp = /^https?:\/\//i;

/**
 * Resolve a URL to be a full URL relative to the requested page.
 */
function resolveUrl(headers, relativeURL) {
	var path = headers[":path"] || "";
	var baseUri = headers[":scheme"] + "://" + headers[":authority"] + path;

	var outURL;
	if (relativeURL && !fullUrlExp.test(relativeURL) ) {
		outURL = url.resolve(baseUri, relativeURL);
	} else {
		outURL = relativeURL;
	}
	return outURL;
}

module.exports = resolveUrl;
