var path = require('path');

var compression = require('compression');
var express = require('express');

var middleware = require('../middleware');
var xhr = require('./xhr');
var proxy = require('./proxy');

module.exports = function (config) {
	var app = express()
		.use(compression())
		.use(xhr());

	if (config.configure) {
		config.configure(app);
	}

	if (config.proxy) {
		var apiPath = config.proxyTo || '/api';
		if(apiPath.charAt(0) !== '/') {
			apiPath = '/' + apiPath;
		}

		app.use(apiPath, proxy(config.proxy));
	}

	app.use(express.static(path.join(config.path)))
		.use(middleware(config))
		.use(function(req, res) {
			var status = res.state.attr('statusCode') || 200;

			res.status(status);
			res.send(res.html);
		});

	return app;
};
