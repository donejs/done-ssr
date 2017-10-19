
module.exports = function(cfg){
	return {
		plugins: [
			require("./load")(cfg),
			require("./cache-normalize"),
			require("./reexecute-main"),
			require("./rendering-base-url"),

			// Style stuff

			// This does the crazy stuff to figure out which CSS is needed
			// for each page.
			require("./styles/assets"),

			// This ensures that all styles are rendered into the document after
			// steal's main has been executed. So that when using incremental
			// rendering, it has the basic styles.
			require("./styles/loaded")()
		]
	};
};
