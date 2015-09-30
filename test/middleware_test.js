var assert = require('assert');
var path = require('path');
var request = require('request');
var express = require('express');

var ssr = require('../lib/middleware');

describe('standalone middleware test', function() {
	it('uses middleware in an Express application', function(done) {
		var root = path.join(__dirname, 'tests');
		var app = express()
			.use('/', express.static(root))
			.use('/', ssr({
				config: path.join(root, 'package.json') + '!npm'
			}));

		var server = app.listen(5500);

		server.on('listening', function() {
			request('http://localhost:5500', function(err, res, body) {
				assert.equal(res.statusCode, 200);
				assert.ok(/You are home/.test(body), 'Got body');
				server.close(done);
			});
		});
	});
});
