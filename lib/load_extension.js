
module.exports = function(loader){
	// Set the extension path.
	loader.paths["steal-server-side-render"] = path.resolve(__dirname + "/extension.js");

	// Ensure the extension loads before the main.
	var loaderImport = loader.import;
	loader.import = function(name){
		if(name === loader.main) {
			var args = arguments;

			return loader.import("steal-server-side-render").then(function(){
				loader.import = loaderImport;
				return loaderImport.apply(loader, args);
			});
		}
		return loaderImport.apply(this, arguments);
	};
};
