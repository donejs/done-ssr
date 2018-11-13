
module.exports = function(headers) {
	return headers[":scheme"] + ":" + headers[":authority"] + headers[":path"];
};
