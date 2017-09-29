
module.exports = function(request, options){
	return {
		plugins: [
			require("./fetch")(request),
			require("./xhr")(request, options),
			require("./websocket")
		]
	};
};
