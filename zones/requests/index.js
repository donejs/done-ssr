
module.exports = function(request){
	return {
		plugins: [
			require("./fetch")(request)
			// TODO XHR
		]
	};
};
