var bundleHelpers;

module.exports = function(data){
	return {
		beforeStealStartup: function(){
			bundleHelpers = traceBundles(data.steal.loader)
		},
		created: function(){
			Object.defineProperty(data, "bundleHelpers", {
				get: function() { return bundleHelpers }
			});
		}
	}
};

function traceBundles(loader){
	var bundles = {"@global": {}};
	var parentMap = loader.__ssrParentMap = {};

	function setAsBundle(name, parentName){
		var p = Promise.resolve(loader.normalize(name, parentName));
		return p.then(function(name) {
			if(!bundles[name]) {
				bundles[name] = {};
			}
		});
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


	function assetRegister(moduleName, type, makeAsset) {
		var bundle;
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
					var childBundle = findBundle(childName);
					if(childBundle) {
						childBundle[childName] = {
							id: moduleName,
							type: type,
							value: makeAsset
						};
					}
					if(!bundle && childBundle) {
						bundle = childBundle;
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

	if(loader.main) {
		setAsBundle(loader.main);
	}

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
			if(name === loader.main) {
				loader.normalizedMain = normalizedName;
			}
			return normalizedName;
		});
	};

	return {
		bundles: bundles,
		findBundle: findBundle
	};

};
