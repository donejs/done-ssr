
module.exports = function(cfg, response){
	return {
		plugins: [
			require("../steal")(cfg),
			require("../canjs")(response),

			// This does the crazy stuff to figure out which CSS is needed
			// for each page.
			require("./assets")
		]
	};
};
