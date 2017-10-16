
module.exports = function(cfg){
	return {
		plugins: [
			require("./load")(cfg),
			require("./cache-normalize"),
			require("./reexecute-main"),
			require("./rendering-base-url")
		]
	};
};
