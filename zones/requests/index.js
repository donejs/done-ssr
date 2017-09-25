
module.exports = function(request){
	return {
		plugins: [
			require("./fetch")(request),
			require("./xhr")(request)
		]
	};
};
