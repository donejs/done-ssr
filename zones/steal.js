var Steal = require("steal");
var ReloadableStartup = require("../lib/reloadable-startup");

var mains = new Map();

module.exports = function(cfg){
	if(typeof cfg === "string") {
		cfg = { main: cfg };
	}

	var startup, steal;

	function configureAndRun(){
		steal = Steal.clone();
		var loader = global.System = steal.System;

		var nodeEnv = process.env.NODE_ENV || "development";
		loader.config({
			env: "server-" + nodeEnv
		});

		steal.config(cfg);

		// Start her up
		var startup = new ReloadableStartup(steal);
		return startup;
	}

	return function(data){
		function makeRun(zone) {
			var run = zone.run;
			return function(runFn){
				return run.call(this, function(){
					var startup;
					if(mains.has(cfg.main)) {
						startup = mains.get(cfg.main);
					} else {
						//startup = this.waitFor(configureAndRun)();
						startup = configureAndRun();
						mains.set(cfg.main, startup);
					}

					startup.promise.then(function(modules){
						if(runFn) {
							runFn();
						} else {
							var main = modules.main;
							debugger;
							(main.default || main)(data.request);
						}

					});
				});
			};
		}

		// TODO the crazy steal tracing stuff
		return {
			created: function(){
				this.run = makeRun(this);
				data.steal = steal;
			}
		};
	};
};
