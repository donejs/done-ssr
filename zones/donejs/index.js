
module.exports = function(cfg){
	return {
		plugins: [
			require("../steal")(cfg),
			require("../canjs")(),

			// This does the crazy stuff to figure out which CSS is needed
			// for each page.
			require("./assets")
		]
	};
};
