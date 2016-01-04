// Imports
var loader = require("@loader");

// Exports
exports.setAsBundle = setAsBundle;
exports.findBundle = findBundle;

var bundles = exports.bundles = {"@global": {}};
var parentMap = exports.parentMap = {};

function setAsBundle(name, parentName){
	return loader.normalize(name, parentName).then(function(name) {
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

