var Readable = require("stream").Readable;

module.exports = function(url, options, data, stream){
	if(stream.stream) {
		stream = stream.stream;
	}

	if(stream.pushStream && stream.pushAllowed) {
		stream.pushStream({":path": url}, (err, pushStream) => {
			if(err) {
				throw err;
			}

			pushStream.respond({
				":status": 200,
				"content-type": "application/json"
			});

			getReadable(data).pipe(pushStream);
		});
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
