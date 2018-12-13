var isHTTP1Request = require("./is_http1_request");

module.exports = function(data, request, stream) {
	var isH1 = isHTTP1Request(request);
	data.httpVersion = isH1 ? "h1" : "h2";
	data.isHTTP1 = isH1;
	data.isHTTP2 = !isH1;
	data.pushAllowed = !!(data.isHTTP2 && stream.pushAllowed);
};
