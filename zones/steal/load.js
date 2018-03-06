var ReloadableStartup = require("../../lib/reloadable-startup");
var Steal = require("steal");

var mains = new Map();
var MAIN_LOADED = Symbol("done-ssr-mainloaded");

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
			var Zone = zone.constructor;
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

					// live-reload error occurred, push the error into the stack.
					if(startup.error) {
						Zone.error(startup.error);
						return;
					}

					startup.promise.then(function(modules){
						zone.data.modules = modules;
						zone.execHook("afterStealDone");
						if(runFn) {
							runFn();
						} else {
							var render = modules.main.default || modules.main;
							if(typeof render === "function") {
								render(data.request);
							} else if(typeof data.mainExecute === "function" &&
								data.steal[MAIN_LOADED]) {
								data.mainExecute();
							}

							data.steal[MAIN_LOADED] = true;
							zone.execHook("afterStealMain");
						}
					})
					.then(doneResolve, function(err){
						doneReject(err);
						Zone.error(err);
					});
				});
			};
		}

		return {
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
