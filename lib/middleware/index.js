require('./websocket');

var path = require('path');
var url = require('url');
var os = require('os');

var ssr = require('./../index.js');
var doctype = '<!DOCTYPE html>';
var XHR = require('./xhr');

module.exports = function(system) {
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

	var render = ssr(system);

	return function (req, res, next) {
		var pathname = url.parse(req.url).href;

		XHR.base = req.protocol + '://' + req.get('host');

		render(pathname).then(function(result) {
			var dt = system.doctype || doctype;
			var status = result.state.attr('statusCode') || 200;

			res.status(status);
			res.send(dt + '\n' + result.html);
		}, next);
	};
};
