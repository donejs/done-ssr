
module.exports = function(cfg){
	return {
		plugins: [
			require("./steal")(cfg),
			require("./canjs")()
		]
	};
};
