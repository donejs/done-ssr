var fs = require("fs");
var path = require("path");
var cloneUtils = require("ir-clone");
var supportsPreloadFetch = require("../../lib/util/supports_preloadfetch");

var clientScript = getClientScript();

module.exports = function(url){
	return function(data){
		function injectStuff() {
			var usePreload = !data.pushAllowed && supportsPreloadFetch(data.request);

			cloneUtils.injectFrame(data.document, {
				reattachScript: clientScript,
				streamUrl: url,
				preload: usePreload
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
