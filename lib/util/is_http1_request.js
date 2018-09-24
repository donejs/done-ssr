
// An IncomingMessage always has a `.headers` property.
function isIncomingMessage(request) {
	return !!request.headers;
}

module.exports = isIncomingMessage;
