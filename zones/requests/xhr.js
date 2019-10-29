var makeHeaders = require("../../lib/util/make_headers");
var xhrResolveUrl = require("./xhr-resolve-url");
var xhrCookies = require("./xhr-cookies");
var xhrCache = require("./xhr-cache");

module.exports = function(requestOrHeaders, options){
	var headers = makeHeaders(requestOrHeaders);

	var plugins = [ xhrResolveUrl(headers) ];

	// Users can opt-out of rendering the XHR_CACHE by providing xhrCache: false
	if(!options || options.xhrCache !== false) {
		plugins.push(xhrCache);
	}

	plugins.push(xhrCookies(headers, options || {}));

	return {
		plugins: plugins
	};
};
