var path = require('path');
var url = require('url');

var ssr = require('./index.js');
var doctype = '<!DOCTYPE html>';

module.exports = function(system, options) {
	var pkgPath = path.join(options.path, 'package.json');
	var pkg = require(pkgPath);

	// Default to using the npm plugin
	if(!system.config) {
		system.config = pkgPath + "!npm";
	}

	// In production we need to pass in the main, otherwise it doesn't know what
	// bundle to load from.
	if(process.env.NODE_ENV === "production") {
		system.main = (pkg.system && pkg.system.main) || pkg.main;
	}

	var render = ssr(system);

	return function (req, res, next) {
		var pathname = url.parse(req.url).pathname;

		render(pathname).then(function(result) {
			var dt = options.doctype || doctype;

			res.html = dt + '\n' + result.html;
			res.state = result.state;

			next();
		});
	};
};
