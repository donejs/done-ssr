var loader = require("@loader");
var parentMap = loader.has("@ssr/bundles") ?
	loader.get("@ssr/bundles").default.parentMap : undefined;

module.exports = function(moduleName, options){
	var parentName = options ? options.name : undefined;

	return loader.normalize(moduleName, parentName).then(function(name){
		if(parentMap) {
			parentMap[name] = false;
		}

		if(typeof Zone !== "undefined" && Zone.current){
			var zoneData = Zone.current.data;
			var pages = zoneData.pages;
			if(!pages) {
				pages = zoneData.pages = [];
			}
			pages.push(name);
		}

		return loader.import(moduleName, options);
	});
};
