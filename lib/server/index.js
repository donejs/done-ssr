var path = require('path');

var compression = require('compression');
var express = require('express');

var middleware = require('../middleware');
var proxy = require('./proxy');

module.exports = function (options) {
	var app = express()
		.use(compression());

	if (options.configure) {
		options.configure(app);
	}

	if (options.proxy) {
		var apiPath = options.proxyTo || '/api';
		if(apiPath.charAt(0) !== '/') {
			apiPath = '/' + apiPath;
		}

		app.use(apiPath, proxy(options.proxy));
	}

	app.use(express.static(path.join(options.path)))
		.use(middleware({config: path.join(options.path, 'package.json') + '!npm', }));

	return app;
};
