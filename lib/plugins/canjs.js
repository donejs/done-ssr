var loader = require("@loader");
var stache = require("can/view/stache/stache");
require("can/view/import/import");
var helpers = require("@ssr/bundles");

// Bundle helpers
var findBundle = helpers.findBundle;
var bundles = helpers.bundles;
var parentMap = helpers.parentMap;

function isProduction(options){
	var prod = process.env.NODE_ENV === "production";
	if(prod) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
}

function assetHelper(type){
	var state = this;
	var assets = this.attr("__renderingAssets");
	var complete = this.attr("__renderingComplete");
	var frag = document.createDocumentFragment();

	if(complete) {
		var inserted = {};

		assets.each(function(moduleName){
			var bundle = findBundle(moduleName) || bundles[moduleName];

			if(bundle) {
				Object.keys(bundle).forEach(function(childName){
					var asset = bundle[childName];
					if(asset && asset.type === type && !inserted[asset.id]) {
						inserted[asset.id] = true;
						var node = asset.value.call(state);
						node.setAttribute("asset-id", asset.id);
						frag.appendChild(node);
					}
				});
			}
		});

		var globals = bundles["@global"];
		Object.keys(globals).forEach(function(moduleName){
			var asset = globals[moduleName];
			if(asset.type === type) {
				var node = asset.value.call(state);
				if(node.setAttribute) {
					node.setAttribute("asset-id", "@" + asset.type);
				}
				frag.appendChild(node);
			}
		});
	}

	return frag;
}

stache.registerHelper("asset", assetHelper);
stache.registerHelper("isProduction", isProduction);

/**
 * Overwrite can-import to mark pages as rendering assets.
 */
var canImport = can.view.callbacks._tags["can-import"];
can.view.callbacks._tags["can-import"] = function(el, tagData){
	var moduleName = el.getAttribute("from");
	var templateModule = tagData.options.attr("helpers.module");
	var parentName = templateModule ? templateModule.id : undefined;

	var isAPage = !!tagData.subtemplate;
	loader.normalize(moduleName, parentName).then(function(name){
		if(isAPage) {
			parentMap[name] = false;
		}
		canWait.data({ page: name });
	});

	canImport.apply(this, arguments);
};
