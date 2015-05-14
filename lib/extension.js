"format cjs";

// Imports
var loader = require("@loader");
var stache = require("can/view/stache/stache");
require("can/view/import/import");

var bundles = {};
var parentMap = {};

setAsBundle(loader.main);

loader.set("asset-register", loader.newModule({
	__useDefault: true,
	"default": assetRegister
}));

stache.registerHelper("asset", assetHelper);

function setAsBundle(name){
	return loader.normalize(name).then(function(name) {
		if(!bundles[name]) bundles[name] = {};
	});
}

function assetRegister(entry){
	var id = entry.id;
	var bundle = findBundle(id);

	bundle[id] = entry;
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
	var assets = this.attr("@assets");
	assets.attr("length");

	var inserted = {};
	var frag = document.createDocumentFragment();
	assets.each(function(moduleName){
		var bundle = findBundle(moduleName) || bundles[moduleName];

		if(bundle) {
			Object.keys(bundle).forEach(function(childName){
				var asset = bundle[childName];
				if(asset && !inserted[asset.id]) {
					inserted[asset.id] = true;
					var node = asset.value();
					node.setAttribute("can-asset-id", asset.id);
					frag.appendChild(node);
				}
			});
		}
	});

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
	if(!root.attr("@assets")) {
		root.attr("@assets", []);
	}

	var moduleName = el.getAttribute("from");

	// Override waitFor temporarily.
	var waitFor = root.waitFor;
	root.waitFor = function(dfd){
		dfd = dfd.then(function(val){
			var newDfd = new can.Deferred();

			loader.normalize(moduleName).then(function(name){
				root.attr("@assets").push(name);
				newDfd.resolve(val);
			});

			return newDfd;
		});
		waitFor.call(this, dfd);
	};

	canImport.apply(this, arguments);

	root.waitFor = waitFor;
};
