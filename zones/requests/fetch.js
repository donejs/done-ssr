var assert = require("assert");
var makeHeaders = require("../../lib/util/make_headers");
var nodeFetch = require("node-fetch");
var PassThrough = require("stream").PassThrough;
var resolveUrl = require("../../lib/util/resolve_url");
var TextDecoder = require("text-encoding").TextDecoder;
var webStreams = require("donejs-node-web-streams");
var toWebReadableStream = webStreams.toWebReadableStream;
var Override = require("../../lib/override");
var isHttps = /^https/;

module.exports = function(requestOrHeaders){
	var headers = makeHeaders(requestOrHeaders);
	function fetch(relativeUrl, options){
		assert(typeof relativeUrl === "string",
			"done-ssr currently only supports a string as the parameter to fetch()");


		var url = resolveUrl(headers, relativeUrl);

		var agent;
		if(isHttps.test(url) && url.indexOf("localhost") !== -1) {
			var https = require("https");
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
			var body = resp.body.pipe(new PassThrough());
			var response = Object.create(resp, {
				body: {
					value: toWebReadableStream(body)
				},
				_readableBody: {
					enumerable: false,
					value: resp.body
				},
				json: {
					value: resp.json.bind(resp)
				},
				text: {
					value: resp.text.bind(resp)
				}
			});
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
