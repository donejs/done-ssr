var Readable = require("stream").Readable;

module.exports = function(url, options, data, res){
	if(res.push) {
		var opts = options || {
			status: 200,
			method: "GET",
			request: { accept: "*/*" },
			response: { "content-type": "application/json" }
		};

		var writable = res.push(url, opts);

		// If the response is ended a writable is not created
		if(writable) {
			getReadable(data).pipe(writable);
		}
	}
};

function getReadable(stream) {
	var s = stream;
	if(typeof stream === "string") {
		s = new Readable();
		s._read = Function.prototype;
		s.push(stream);
		s.push(null);
	}
	return s;
}
