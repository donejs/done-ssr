var path = require('path');
var url = require('url');

var ssr = require('./index.js');
var doctype = '<!DOCTYPE html>';

module.exports = function(config) {
	var pkgPath = path.join(config.path, 'package.json');
	var pkg = require(pkgPath);

	var system = {
		config: pkgPath + '!npm'
	};

	// In production we need to pass in the main, otherwise it doesn't know what
	// bundle to load from.
	if(process.env.NODE_ENV === "production") {
		system.main = (pkg.system && pkg.system.main) || pkg.main;
	}

	var render = ssr(system);

	return function (req, res, next) {
		var pathname = url.parse(req.url).pathname;

		render(pathname).then(function(result) {
			var dt = config.doctype || doctype;

			res.html = dt + '\n' + result.html;
			res.state = result.state;

			next();
		});
	};
};
