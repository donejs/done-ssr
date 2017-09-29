
module.exports = function(data){
	return {
		beforeStealStartup: function(){
			var steal = data.steal;
			var loader = steal.loader;

			// Ensure the extension loads before the main.
			var loaderImport = loader.import;
			loader.import = function(name){
				if(name === loader.main) {
					var args = arguments;

					// Set up the default renderingBaseURL which plugins use to
					// create addresses for assets when baseURL is pointing to
					// a file:// when running in SSR on the server.
					if(!loader.renderingBaseURL) {
						var baseURL = loader.renderingBaseURL || loader.baseURL;
						if(baseURL.indexOf("file:") === 0) {
							baseURL = "/";
						}
						loader.renderingBaseURL = baseURL;
					}

					return loaderImport.apply(loader, args);
				}
				return loaderImport.apply(this, arguments);
			};
		}
	};
};
