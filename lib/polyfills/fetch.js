var assert = require("assert");
var nodeFetch = require("node-fetch");
var resolveUrl = require("../util/resolve_url");
var TextDecoder = require("text-encoding").TextDecoder;
var webStreams = require("node-web-streams");
var toWebReadableStream = webStreams.toWebReadableStream;

global.ReadableStream = webStreams.ReadableStream;
global.TextDecoder = TextDecoder;

global.fetch = function(relativeUrl){
	assert(typeof relativeUrl === "string", "done-ssr currently only supports a string as the parameter to fetch()");

	var url = resolveUrl(global.doneSsr.request, relativeUrl);

	return nodeFetch(url).then(function(resp){
		// Convert the Node.js Readable stream to a WHATWG stream.
		resp.body = toWebReadableStream(resp.body);
		return resp;
	});
};
