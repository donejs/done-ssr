var assert = require("assert");
var https = require("https");
var nodeFetch = require("node-fetch");
var resolveUrl = require("../util/resolve_url");
var safePush = require("../util/safe_push");
var TextDecoder = require("text-encoding").TextDecoder;
var webStreams = require("node-web-streams");
var toWebReadableStream = webStreams.toWebReadableStream;

global.ReadableStream = webStreams.ReadableStream;
global.TextDecoder = TextDecoder;

var isHttps = /^https/;

global.fetch = function(relativeUrl){
	assert(typeof relativeUrl === "string", "done-ssr currently only supports a string as the parameter to fetch()");

	var url = resolveUrl(global.doneSsr.request, relativeUrl);

	var agent;
	if(isHttps.test(url) && url.indexOf("localhost") !== -1) {
		agent = new https.Agent({
			rejectUnauthorized: false
		});
	}

	return nodeFetch(url, { agent: agent }).then(function(resp){
		if(global.doneSsr.pushResources) {
			var responses = global.doneSsr.responses || [];
			var push = safePush.bind(null, relativeUrl, null, resp.body);
			responses.forEach(push);
		}

		// Convert the Node.js Readable stream to a WHATWG stream.
		resp.body = toWebReadableStream(resp.body);
		return resp;
	});
};
