var assert = require("assert");
var https = require("https");
var nodeFetch = require("node-fetch");
var resolveUrl = require("../../lib/util/resolve_url");
var TextDecoder = require("text-encoding").TextDecoder;
var webStreams = require("node-web-streams");
var toWebReadableStream = webStreams.toWebReadableStream;
var Override = require("../../lib/override");
var isHttps = /^https/;

module.exports = function(request){
	function fetch(relativeUrl){
		assert(typeof relativeUrl === "string",
			"done-ssr currently only supports a string as the parameter to fetch()");

		var url = resolveUrl(request, relativeUrl);

		var agent;
		if(isHttps.test(url) && url.indexOf("localhost") !== -1) {
			agent = new https.Agent({
				rejectUnauthorized: false
			});
		}

		var options = {
			agent: agent,

			// Disable gzip compression because it
			// eliminates streaming
			compress: false
		};

		return nodeFetch(url, options).then(function(resp){
			var response = Object.assign({}, resp);

			// Convert the Node.js Readable stream to a WHATWG stream.
			response._readableBody = resp.body;
			response.body = toWebReadableStream(resp.body);
			response.json = resp.json.bind(resp);
			response.text = resp.text.bind(resp);
			return response;
		});
	}

	return {
		globals: {
			ReadableStream: webStreams.ReadableStream,
			TextDecoder: TextDecoder,
			fetch: fetch
		}
	};
};
