var url = require("url");
var fullUrlExp = /^https?:\/\//i;

/**
 * Resolve a URL to be a full URL relative to the requested page.
 */
function resolveUrl(req, relativeURL) {
	var baseUri = req.url || "";
	if (req.protocol && req.get) {
		baseUri = req.protocol + '://' + req.get("host") + baseUri;
	}

	var outURL;
	if (relativeURL && !fullUrlExp.test(relativeURL) ) {
		outURL = url.resolve(baseUri, relativeURL);
	} else {
		outURL = relativeURL;
	}
	return outURL;
}

module.exports = resolveUrl;
