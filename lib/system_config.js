"format cjs";

var loader = require('@loader');

if(loader.env === "development" && typeof window === "undefined" && !loader.buildMode) {

	exports.systemConfig = {
		meta: {
			'jquery': {
				"format": "global",
				"exports": "jQuery",
				"deps": ["can/util/vdom/vdom"]
			}
		}
	};
}
