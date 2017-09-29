var CACHE_NORMALIZE = Symbol("done-ssr-cachenormalize");

module.exports = function(data){
	return {
		beforeStealStartup: function(){
			if(!data.steal.loader[CACHE_NORMALIZE]) {
				addCacheNormalize(data.steal.loader);
			}
		}
	};
};

function addCacheNormalize(loader) {
	var getCacheName = function(identifier, parentName){
		var parentModuleName = parentName || "@none";
		var cacheName = identifier + "+" + parentModuleName;
		return cacheName;
	};

	loader[CACHE_NORMALIZE] = true;
	loader._normalizeCache = Object.create(null);

	var normalize = loader.normalize;
	loader.normalize = function(name, parentName){
		var cacheName = getCacheName(name, parentName);
		var cache = this._normalizeCache;

		if(cacheName in cache) {
			var moduleName = cache[cacheName];
			if(moduleName in this._loader.modules) {
				return Promise.resolve(moduleName);
			}
		}

		return Promise.resolve(normalize.apply(this, arguments))
		.then(function(normalizedName) {
			cache[cacheName] = normalizedName;
			return normalizedName;
		});
	};
}
