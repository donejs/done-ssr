exports.modules = {
	"can": "can-util/namespace",
	"DOCUMENT": "can-util/dom/document/document"
};

// Logic that needs to run when steal starts up.
// The callback is to provide the new value of `startup` when a reload
// cycle completes.
module.exports = function(steal, callback){
	var loader = steal.System;

	// Steal thinks it's running in a browser if there's a global document
	var doc = global.document;
	delete global.document;
	var startupPromise = steal.startup();
	global.document = doc;

	var extractModules = makeExtractModules(loader);

	return startupPromise
	.then(function(main) {
		if(!doneSsr.globalDocument && typeof document !== "undefined") {
			doneSsr.globalDocument = document;
		}

		// If live-reload is enabled we need to get a new main each
		// time a reload cycle is complete.
		if(loader.has("live-reload") || loader.liveReloadInstalled) {
			var importOpts = {name: "@ssr"};
			loader.import("live-reload", importOpts).then(function(reload){
				reload(function(){
					callback(
						loader.import(loader.main)
							.then(getMainModule)
							.then(extractModules)
					);
				});
			});
		}
		return getMainModule(main).then(extractModules);
	});
};

function makeExtractModules(loader){
	function getModule(identifier){
		return loader.normalize(identifier, "@ssr")
		.then(function(name){
			var mod = loader.get(name);
			return mod ? mod.default || mod : undefined;
		});
	}

	return function(main){
		var modules = { main: main };

		var promises = Object.keys(exports.modules).map(function(key){
			var moduleName = exports.modules[key];

			return getModule(moduleName).then(function(value){
				modules[key] = value;
			});
		});

		return Promise.all(promises).then(function(){
			return modules;
		});
	};
}

function getMainModule(main){
	// startup returns an Array in dev
	main = Array.isArray(main) ? main[0] : main;
	return main.importPromise || Promise.resolve(main);
}

