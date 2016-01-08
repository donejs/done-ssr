var assert = require('assert');
var path = require('path');
var http = require('http');
var request = require('request');
var socketio = require('socket.io');
var socketClient = require('socket.io-client');

var serve = require('../lib/server');

describe('can-serve tests', function() {
	var server, other, io;

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

		io = socketio().listen(other);

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

	it('starts SSR with package.json settings and outputs page with 200 status', function(done) {
		request('http://localhost:5050', function(err, res, body) {
			assert.equal(res.statusCode, 200);
			assert.ok(/You are home/.test(body), 'Got body');
			done();
		});
	});

	it('route errors send 404 status', function(done) {
		request('http://localhost:5050/invalid/route', function(err, res, body) {
			assert.equal(res.statusCode, 404);
			assert.ok(/Error: Not found/.test(body), 'Got body');
			done();
		});
	});

	it('proxies to other servers on a path', function(done) {
		request('http://localhost:5050/testing/', function(err, res, body) {
			assert.equal(body, 'Other server\n', 'Got message from other server');
			done();
		});
	});

	it('proxies Socket.io websockets', function(done) {
		var original = { hello: 'world' };
		var oldDocument = global.document;

		// socket.io-client doesn't like our document shim but we don't need it for this test
		// See https://github.com/socketio/socket.io-client/issues/916
		delete global.document;

		io.on('connection', function (socket) {
		  socket.emit('news', original);
		});

		var socket = socketClient('http://localhost:6060');

		socket.on('news', function(data) {
			assert.deepEqual(data, original);
			socket.disconnect();
		});

		socket.on('disconnect', function() {
			// Timeout for Socket.io cleanup on slower machiens (like CI) finish
			setTimeout(function() {
				global.document = oldDocument;
				done();
			}, 500);
		});
	});

	it('server should parse URL parameters (#52)', function(done) {
		request('http://localhost:5050/test?param=paramtest', function(err, res, body) {
			assert.equal(res.statusCode, 200);
			assert.ok(/paramtest/.test(body), 'Param printed in body');
			done();
		});
	});

	it('errors when rendering an app trigger Express error handler (#58)',function(done) {
		request('http://localhost:5050/?err=true', function(err, res, body) {
			assert.equal(res.statusCode, 500);
			assert.ok(/Something went wrong/.test(body), 'Got error message');
			done();
		});
	});
});
