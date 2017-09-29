var makeRender = require("../../lib/make_render");
var ReloadableStartup = require("../../lib/reloadable-startup");
var Steal = require("steal");

var mains = new Map();

module.exports = function(cfg){
	if(typeof cfg === "string") {
		cfg = { main: cfg };
	}

	function configureAndStartup(zone){
		steal = Steal.clone();
		var loader = global.System = steal.System;

		var nodeEnv = process.env.NODE_ENV || "development";
		loader.config({
			env: "server-" + nodeEnv
		});

		steal.config(cfg);

		zone.data.steal = steal;
		zone.execHook("beforeStealStartup");

		// Start her up
		var startup = new ReloadableStartup(steal);
		return startup;
	}

	return function(data){
		var doneResolve, doneReject;
		var ready = new Promise(function(resolve, reject){
			doneResolve = resolve;
			doneReject = reject;
		});

		function makeRun(zone) {
			var run = zone.run;
			return function(runFn){
				return run.call(this, function(){
					var startup;
					if(mains.has(cfg.main)) {
						startup = mains.get(cfg.main);
					} else {
						startup = configureAndStartup(zone);
						mains.set(cfg.main, startup);
					}

					data.steal = startup.steal;
					startup.promise.then(function(modules){
						zone.data.modules = modules;
						zone.execHook("afterStealDone");
						if(runFn) {
							runFn();
						} else {
							var render = makeRender(modules.main, modules.can);
							render(data.request);

							zone.execHook("afterStealMain");
						}
					})
					.then(doneResolve, doneReject)
					.catch(function(error){
						// This prevents the error from being unhandled, but
						// is still part of the Zone
						setTimeout(function(){
							throw error;
						});
					})
				});
			};
		}

		return {
			plugins: [
				require("./cache-normalize"),
				require("./render-base-url")
			],
			created: function(){
				data.ready = ready;
				this.run = makeRun(this);
			},
			hooks: [
				"beforeStealStartup",
				"afterStealDone",
				"afterStealMain"
			]
		};
	};
};
