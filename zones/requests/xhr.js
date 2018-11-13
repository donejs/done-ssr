var makeHeaders = require("../../lib/util/make_headers");
var xhrResolveUrl = require("./xhr-resolve-url");
var xhrCookies = require("./xhr-cookies");
var xhrCache = require("./xhr-cache");

module.exports = function(requestOrHeaders, options){
	var headers = makeHeaders(requestOrHeaders);
	return {
		plugins: [
			xhrResolveUrl(headers),
			xhrCache,
			xhrCookies(headers, options || {})
		]
	};
};
