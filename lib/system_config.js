"format cjs";

require('@loader');

var isNode = typeof process === "object" &&
	{}.toString.call(process) === "[object process]";

if(isNode) {
	exports.systemConfig = {
		map: {
			"can/util/vdom/vdom": "can/util/vdom/vdom"
		},
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
