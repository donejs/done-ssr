var stealStartup = require("./startup");

/*
 * Provides a way to listen to reloads
 * and replaces the previous steal.startup() promise
 * with the replaced one.
 **/

function ReloadableStartup(steal) {
    this.steal = steal;

    // Initialize to null; we don't know if this is a can project yet
    this.isACanProject = null;

    var replaceStartup = function(mainPromise){
		var oldPromise = this.promise;
		this.promise = mainPromise.then(function(modules){
			// We were unable to reload the can modules which means
			// there is some bug. But we can continue to render anyways.
			if(this.isACanProject && !modules.can) {
				return oldPromise;
			}

			return modules;
		}.bind(this));
	}.bind(this);

	this.promise = stealStartup(steal, replaceStartup);
}

module.exports = ReloadableStartup;