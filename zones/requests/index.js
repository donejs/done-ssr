
module.exports = function(headers, options){
	return {
		plugins: [
			require("./fetch")(headers),
			require("./xhr")(headers, options),
			require("./websocket")
		]
	};
};
