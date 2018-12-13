var makeHeaders = require("../../lib/util/make_headers");
var mutations = require("../mutations");
var reattach = require("./reattach");
var setHTTPVersion = require("../../lib/util/set_http_version");

module.exports = function(requestOrHeaders, stream,
	url = `/_donessr_instructions/${Date.now()}`, pushStreams = new Map()) {
	var headers = makeHeaders(requestOrHeaders);
	if(stream.stream) {
		stream = stream.stream;
	}

	return function(data){
		setHTTPVersion(data, requestOrHeaders, stream);
		var instrStream;

		return {
			plugins: [
				reattach(url),
				mutations()
			],

			created: function(){
				// If this is HTTP/1 a preload link is added.
				if(!data.pushAllowed) {
					pushStreams.set(url, data.mutations);
					return;
				}

				// Must be http/2 then
				stream.pushStream({":path": url}, (err, pushStream) => {
					if(err) throw err;

					pushStream.respond({
						":status": 200,
						"content-type": "text/plain"
					});

					data.mutations.pipe(pushStream);
				});
			},

			ended: function(){
				// TODO does this need to happen?
				//instrStream.end();
			}
		};
	};
};
