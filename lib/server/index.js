var path = require('path');
var url = require('url');

var compression = require('compression');
var express = require('express');

var ssr = require('../index');
var xhr = require('./xhr');
var proxy = require('./proxy');
var doctype = '<!DOCTYPE html>';

module.exports = function (config) {
	var app = express()
		.use(compression())
		.use(xhr());

	var pkgPath = path.join(config.path, 'package.json');
	var pkg = require(pkgPath);
	var render = ssr({
		config: pkgPath + '!npm',
		main: pkg.main
	});


	if (config.configure) {
		config.configure(app);
	}

	if (config.proxy) {
		var apiPath = config.proxyTo || '/api';
		app.use(apiPath, proxy(config.proxy));
	}

	app.use(express.static(path.join(config.path)));

	app.use("/", function (req, res) {
		var pathname = url.parse(req.url).pathname;

		render(pathname).then(function(html) {
			var dt = config.doctype || doctype;
			res.send(dt + '\n' + html);
		});
	});

	return app;
};
