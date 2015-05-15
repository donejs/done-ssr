
// This allows you to alias a package with the default package. We need this
// because the extension depends on `can/` modules and those will not normalize
// correctly without this.
module.exports = function(loader, packageFolder){
	var npmPaths;
	Object.defineProperty(loader, "npmPaths", {
		get: function(){
			return npmPaths;
		},
		set: function(v){
			npmPaths = v;
			var __default;
			Object.defineProperty(npmPaths, "__default", {
				get: function() { return __default; },
				set: function(v) {
					__default = v;

					npmPaths["file:"+packageFolder] = __default;
				}
			});
		}
	});

};
