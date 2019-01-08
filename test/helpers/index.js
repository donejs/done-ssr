var moUtils = require("done-mutation-observer");

exports.mockXHR = require("./xhr");

Object.assign(exports, require("./dom"));
Object.assign(exports, require("./incremental"));
Object.assign(exports, require("./request"));
Object.assign(exports, require("./server"));
Object.assign(exports, require("./ua"));
Object.assign(exports, require("./logging"));

exports.removeMutationObserverZone = function(data) {
	return {
		ended: function(){
			moUtils.removeMutationObserver(data.window);
		}
	};
};
