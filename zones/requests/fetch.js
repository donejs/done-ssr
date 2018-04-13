var assert = require("assert");
var https = require("https");
var nodeFetch = require("node-fetch");
var PassThrough = require("stream").PassThrough;
var resolveUrl = require("../../lib/util/resolve_url");
var TextDecoder = require("text-encoding").TextDecoder;
var webStreams = require("donejs-node-web-streams");
var toWebReadableStream = webStreams.toWebReadableStream;
var Override = require("../../lib/override");
var isHttps = /^https/;

module.exports = function(request){
	function fetch(relativeUrl, options){
		assert(typeof relativeUrl === "string",
			"done-ssr currently only supports a string as the parameter to fetch()");

		var url = resolveUrl(request, relativeUrl);

		var agent;
		if(isHttps.test(url) && url.indexOf("localhost") !== -1) {
			agent = new https.Agent({
				rejectUnauthorized: false
			});
		}

		options = Object.assign({
			agent: agent,

			// Disable gzip compression because it
			// eliminates streaming
			compress: false
		}, options);

		return nodeFetch(url, options).then(function(resp){
			var response = Object.create(resp);

			// Convert the Node.js Readable stream to a WHATWG stream.
			response._readableBody = resp.body;
			var body = resp.body.pipe(new PassThrough());
			response.body = toWebReadableStream(body);
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
