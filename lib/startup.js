function getMainModule(main){
	// startup returns an Array in dev
	main = Array.isArray(main) ? main[0] : main;
	return main.importPromise || Promise.resolve(main);
}

// Logic that needs to run when steal starts up.
// The callback is to provide the new value of `startup` when a reload
// cycle completes.
module.exports = function(steal, callback){
	var loader = steal.System;

	return steal.startup()
	.then(function(main){
		if(typeof document === "undefined") {
			return loader.import("can/util/vdom/vdom", { name: loader.main })
			.then(function(){
				return main;
			});
		} else {
			return Promise.resolve(main);
		}
	}).then(function(main) {
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
						loader.import(loader.main).then(getMainModule)
					);
				});
			});
		}
		return getMainModule(main);
	});
};
