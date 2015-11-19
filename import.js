var loader = require("@loader");
var parentMap = loader.has("@ssr/bundles") ?
	loader.get("@ssr/bundles").default.parentMap : undefined;

module.exports = function(moduleName, options){
	var parentName = options ? options.name : undefined;

	return loader.normalize(moduleName, parentName).then(function(name){
		if(parentMap) {
			parentMap[name] = false;
		}

		if(typeof canWait !== "undefined" && canWait.data){
			canWait.data({ page: name });
		}

		return loader.import(moduleName, options);
	});

};
