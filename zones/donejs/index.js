
module.exports = function(cfg, response){
	return {
		plugins: [
			require("../steal")(cfg),
			require("../canjs")(response)
		]
	};
};
