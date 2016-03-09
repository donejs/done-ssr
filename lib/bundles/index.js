
module.exports = function(loader){
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
			return normalizedName;
		});
	};

	return {
		bundles: bundles,
		findBundle: findBundle
	};

};
