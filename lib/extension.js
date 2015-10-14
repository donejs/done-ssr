"format cjs";

// Imports
var steal = require("@steal");
var loader = require("@loader");
var stache = require("can/view/stache/stache");
require("can/view/import/import");

var bundles = {"@global": {}};
var parentMap = {};
var mainBundleLoaded = false;
var mightBeABundle = {};
steal.done().then(function() { mainBundleLoaded = true; });

function setAsBundle(name, parentName){
	return loader.normalize(name, parentName).then(function(name) {
		if(!bundles[name]) {
			bundles[name] = {};
		}
	});
}

function isProduction(options){
	var prod = process.env.NODE_ENV === "production";
	if(prod) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
}

function findBundleName(moduleName) {
	var parent = parentMap[moduleName],
		bundleName = parent;
	while(parent) {
		parent = parentMap[parent];
		if(parent) {
			bundleName = parent;
		}
	}
	return bundleName;
}

function findBundle(moduleName){
	var bundleName = findBundleName(moduleName);
	return bundles[bundleName];
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

function assetRegister(moduleName, type, makeAsset) {
	if(arguments.length === 2) {
		makeAsset = type;
		moduleName = type = moduleName;
		bundle = bundles["@global"];
	} else {
		bundle = findBundle(moduleName);
	}

	// If it's not in an existing bundle maybe it's a loader.bundle
	if(!bundle) {
		var loaderBundle = loader.bundles[moduleName];
		if(loaderBundle){
			bundle = bundles[moduleName] = {};
			loaderBundle.forEach(function(childName){
				bundle = findBundle(childName);
				if(bundle) {
					bundle[childName] = {
						id: moduleName,
						type: type,
						value: makeAsset
					};
				}
			});
		}
		// If we still haven't found one, set the bundleName as a bundle.
		if(!bundle) {
			var bundleName = findBundleName(moduleName);
			bundle = bundles[bundleName] = {};
		}
	}

	bundle[moduleName] = {
		id: moduleName,
		type: type,
		value: makeAsset
	};
}

setAsBundle(loader.main);

loader.set("asset-register", loader.newModule({
	__useDefault: true,
	"default": assetRegister
}));

stache.registerHelper("asset", assetHelper);
stache.registerHelper("isProduction", isProduction);

var loaderImport = loader.import;
loader.import = function(name, options){
	var loader = this, args = arguments;
	var parentName = options ? options.name : undefined;

	return setAsBundle(name, parentName).then(function(){
		return loaderImport.apply(loader, args);
	});
};

var normalize = loader.normalize;
loader.normalize = function(name, parentName){
	var promise = Promise.resolve(normalize.apply(this, arguments));

	return promise.then(function(normalizedName){
		// When the main bundle loads we mark all can-imports as mightBeABundle
		if(mightBeABundle[name] && !parentMap[normalizedName]) {
			parentMap[normalizedName] = false;
		} else if(parentName) {
			parentMap[normalizedName] = parentName;
		}
		return normalizedName;
	});
};

var canImport = can.view.callbacks._tags["can-import"];
can.view.callbacks._tags["can-import"] = function(el, tagData){
	var root = tagData.scope.attr("%root") || tagData.scope.attr("@root");
	var moduleName = el.getAttribute("from");
	var templateModule = tagData.options.attr("helpers.module");
	var parentName = templateModule ? templateModule.id : undefined;

	// If the main is loaded them any imports might be a bundle.
	if(mainBundleLoaded) {
		mightBeABundle[moduleName] = true;
	}

	// Override waitFor temporarily.
	var waitFor = root.waitFor;
	root.waitFor = function(dfd){
		dfd = dfd.then(function(val){
			var newDfd = new can.Deferred();

			loader.normalize(moduleName, parentName).then(function(name){
				root.attr("__renderingAssets").push(name);
				newDfd.resolve(val);
			});

			return newDfd;
		});
		waitFor.call(this, dfd);
	};

	canImport.apply(this, arguments);

	root.waitFor = waitFor;
};

[
	require("@ssr/asset_types/html5")
].forEach(function(fn){
	fn(assetRegister);
});
