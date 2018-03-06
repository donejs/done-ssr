var stealStartup = require("./startup");

/*
 * Provides a way to listen to reloads
 * and replaces the previous steal.startup() promise
 * with the replaced one.
 **/

function ReloadableStartup(steal) {
    this.steal = steal;
	this.error = null;

    var replaceStartup = (err, mainPromise) => {
		if(err) {
			this.error = err;
		} else {
			this.error = null;
			this.promise = mainPromise;
		}
	};

	this.promise = stealStartup(steal, replaceStartup);
}

module.exports = ReloadableStartup;
