var mutations = require("../mutations");
var reattach = require("./reattach");

module.exports = function(stream, url = `/_donessr_instructions/${Date.now()}`){
	return function(data){
		var instrStream;

		return {
			plugins: [
				reattach(url),
				mutations()
			],

			created: function(){
				stream.pushStream({":path": url}, (err, pushStream) => {
					if(err) throw err;

					pushStream.respond({
						":status": 200,
						":method": "GET",
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
