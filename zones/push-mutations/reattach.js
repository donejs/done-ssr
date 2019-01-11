var fs = require("fs");
var path = require("path");
var cloneUtils = require("ir-clone");

var clientScript = getClientScript();

module.exports = function(url){
	return function(data){
		function injectStuff() {
			cloneUtils.injectFrame(data.document, {
				reattachScript: clientScript,
				streamUrl: url,
				preload: !data.pushAllowed
			});
		}

		return {
			created: function() {
				data.injectIRFrame = injectStuff;
			}
		};
	};
};

function getClientScript() {
	var dir = path.dirname(require.resolve("ir-reattach/ir-reattach.mjs"));
	var debugMode = typeof process.env.DONE_SSR_DEBUG !== "undefined";
	var clientPth = `${dir}/ir-reattach${debugMode ? "" : ".min"}.mjs`;
	return fs.readFileSync(clientPth, "utf8");
}
