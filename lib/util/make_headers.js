
// This converts a HTTP/1 Request to HTTP/2 headers object
module.exports = function(request) {
	// Assume anything that doesn't look like an IncomingMessage is already
	// an HTTP/2 headers object
	if(!isIncomingMessage(request)) {
		return request;
	}

	var headers = Object.create(null);
	headers[":method"] = request.method;
	headers[":path"] = request.url || "";
	headers[":scheme"] = request.protocol;

	if(request.get) {
		headers[":authority"] = request.get("host");
	}

	return headers;
};

// An IncomingMessage always has a `.headers` property.
function isIncomingMessage(request) {
	return !!request.headers;
}
