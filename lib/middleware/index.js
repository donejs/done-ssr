require('./websocket');

var path = require('path');
var os = require('os');

var ssr = require('./../index.js');

require( "./xhr" )( global );

module.exports = function(system, options) {
	var pkgPath = path.join(path.dirname(system.config), 'package.json');
	var pkg = require(pkgPath);

	// Default to using the npm plugin
	if(!system.config) {
		system.config = pkgPath + '!npm';
	}
	// liveReload is off by default.
	system.liveReload = !!system.liveReload;
	system.liveReloadAttempts = system.liveReloadAttempts || 3;
	system.liveReloadHost = os.hostname();

	// In production we need to pass in the main, otherwise it doesn't know what
	// bundle to load from.
	if(process.env.NODE_ENV === 'production') {
		system.main = (pkg.system && pkg.system.main) || pkg.main;
	}

	var render = ssr(system, options);

	return function (req, res, next) {
		var stream = render(req);
		stream.on("error", next);
		stream.pipe(res);
	};
};
