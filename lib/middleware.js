var path = require('path');
var url = require('url');

var ssr = require('./index.js');
var doctype = '<!DOCTYPE html>';

module.exports = function(system, options) {
	var pkgPath = path.join(options.path, 'package.json');
	var pkg = require(pkgPath);

	// Default to using the npm plugin
	if(!system.config) {
		system.config = pkgPath + '!npm';
	}

	// In production we need to pass in the main, otherwise it doesn't know what
	// bundle to load from.
	if(process.env.NODE_ENV === 'production') {
		system.main = (pkg.system && pkg.system.main) || pkg.main;
	}

	var render = ssr(system);

	return function (req, res, next) {
		var pathname = url.parse(req.url).href;

		// TODO: Check if pathname matches any configured endpoints. For now just the root.
		if(pathname === '/'){
			render(pathname).then(function(result) {
				var dt = options.doctype || doctype;
				var status = result.state.attr('statusCode') || 200;
	
				res.status(status);
				return res.send(dt + '\n' + result.html);
			});	
		} else {
			next();
		}
	};
};
