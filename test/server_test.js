var assert = require('assert');
var path = require('path');
var http = require('http');
var request = require('request');
var xhr = require('xmlhttprequest').XMLHttpRequest;

var serve = require('../lib/server');

describe('can-serve tests', function() {
	var server, other;

	before(function(done) {
		server = serve({
			path: path.join(__dirname, 'tests'),
			proxy: 'http://localhost:6060',
			proxyTo: 'testing'
		}).listen(5050);

		other = http.createServer(function(req, res) {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('Other server\n');
		}).listen(6060);

		server.on('listening', done);
	});

	after(function(done) {
		server.close(done);
	});

	it('sets XMLHttpRequest polyfill base URL', function(done) {
		request('http://localhost:5050', function() {
			assert.equal(XMLHttpRequest.base, 'http://localhost:5050');
			done();
		});
	});

	it('starts SSR with package.json settings and outputs page', function(done) {
		request('http://localhost:5050', function(err, req, body) {
			assert.ok(/You are home/.test(body), 'Got body');
			done();
		});
	});

	it('proxies to other servers on a path', function(done) {
		request('http://localhost:5050/testing/', function(err, req, body) {
			assert.equal(body, 'Other server\n', 'Got message from other server');
			done();
		});
	});
});
