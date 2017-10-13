var mutations = require("../mutations");
var reattach = require("./reattach");

module.exports = function(response, url){
	if(!url) {
		url = "/_donessr_instructions/" + Date.now();
	}

	return function(data){
		var instrStream;

		return {
			plugins: [
				reattach(url),
				mutations(response)
			],

			created: function(){
				instrStream = response.push(url, {
					status: 200,
					method: "GET",
					request: { accept: "*/*" },
					response: { "content-type": "text/plain" }
				});

				data.mutations.pipe(instrStream);
			},

			ended: function(){
				instrStream.end();
			}
		};
	};
};
