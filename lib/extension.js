"format cjs";

// Imports
var loader = require("@loader");
var helpers = require("@ssr/bundles");

// Bundle helpers
var setAsBundle = helpers.setAsBundle;
var findBundle = helpers.findBundle;
var findBundleName = helpers.findBundleName;
var bundles = helpers.bundles;
var parentMap = helpers.parentMap;

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
		if(parentName && parentMap[normalizedName] !== false) {
			parentMap[normalizedName] = parentName;
		}
		return normalizedName;
	});
};

[
	require("@ssr/asset_types/html5")
].forEach(function(fn){
	fn(assetRegister);
});
