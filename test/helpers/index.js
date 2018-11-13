var moUtils = require("done-mutation-observer");

exports.mockXHR = require("./xhr");

Object.assign(exports, require("./dom"));
Object.assign(exports, require("./incremental"));
Object.assign(exports, require("./request"));
Object.assign(exports, require("./server"));

exports.ua = {
	chrome: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.109 Safari/537.36"
};

exports.removeMutationObserverZone = function(data) {
	return {
		ended: function(){
			moUtils.removeMutationObserver(data.window);
		}
	};
};
