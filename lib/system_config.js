"format cjs";

var loader = require('@loader');

var isNode = typeof process === "object" &&
	{}.toString.call(process) === "[object process]";

if(isNode) {
	exports.systemConfig = {
		meta: {
			'jquery': {
				"format": "global",
				"exports": "jQuery",
				"deps": ["can/util/vdom/vdom"]
			}
		}
	};
} else {
	exports.systemConfig = {
		map: {
			"can/util/vdom/vdom": "@empty"
		}
	};
}
