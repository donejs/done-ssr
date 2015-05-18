"format cjs";

// Imports
var loader = require("@loader");
var stache = require("can/view/stache/stache");
require("can/view/import/import");

var bundles = {"@global": {}};
var parentMap = {};

setAsBundle(loader.main);

loader.set("asset-register", loader.newModule({
	__useDefault: true,
	"default": assetRegister
}));

stache.registerHelper("asset", assetHelper);
stache.registerHelper("isProduction", isProduction);

function setAsBundle(name){
	return loader.normalize(name).then(function(name) {
		if(!bundles[name]) bundles[name] = {};
	});
}

function assetRegister(moduleName, type, makeAsset){
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
				parentMap[childName] = moduleName;
			});
		}
	}

	bundle[moduleName] = {
		id: moduleName,
		type: type,
		value: makeAsset
	};
}

function isProduction(options){
	var prod = process.env.NODE_ENV === "production";
	if(prod) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
}

function findBundle(moduleName){
	var parent = parentMap[moduleName],
	bundleName = parent;
	while(parent) {
		parent = parentMap[parent];
		if(parent) bundleName = parent;
	}
	return bundles[bundleName];
}

function assetHelper(type){
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
						var node = asset.value();
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
				var node = asset.value();
				node.setAttribute("asset-id", "@" + asset.type);
				frag.appendChild(node);
			}
		});
	}

	return frag;
}

var loaderImport = loader.import;
loader.import = function(name){
	var loader = this, args = arguments;
	return setAsBundle(name).then(function(){
		return loaderImport.apply(loader, args);
	});
};

var normalize = loader.normalize;
loader.normalize = function(name, parentName){
	var promise = Promise.resolve(normalize.apply(this, arguments));

	return promise.then(function(normalizedName){
		if(parentName) {
			parentMap[normalizedName] = parentName;
		}
		return normalizedName;
	});
};

var canImport = can.view.callbacks._tags["can-import"];
can.view.callbacks._tags["can-import"] = function(el, tagData){
	var root = tagData.scope.attr("@root");
	var moduleName = el.getAttribute("from");

	// Override waitFor temporarily.
	var waitFor = root.waitFor;
	root.waitFor = function(dfd){
		dfd = dfd.then(function(val){
			var newDfd = new can.Deferred();

			loader.normalize(moduleName).then(function(name){
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
