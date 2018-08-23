var path = require("path");
var assert = require("assert");
var ssr = require("../lib/");
var helpers = require("./helpers");
var through = require("through2");

describe("auth cookies - failed domain", function() {
	this.timeout(10000);

	var render, authHeader;

	before(function(done) {
		render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "xhr/index.stache!done-autorender"
		}, {
			auth: {
				cookie: 'feathers-jwt',
				domains: [
					'canjs.com',
					'donejs.com'
				]
			}
		});

		helpers.createServer(8070, function(req, res){
			var data;
			authHeader = req.headers.authorization;
			switch(req.url) {
				case "/api/list":
					data = [1,2,3,4,5];
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify(data));
					break;
				default:
					throw new Error("No route for " + req.url);
			}
		})
		.then(server => {
			this.server = server;
			done();
		});
	});

	after(function() {
		this.server.close();
	});

	it("works", function(done) {
		var stream = render({
			url: '/',
			connection: {},
			headers: {
				host: "localhost",
				cookie: "feathers-jwt=foobar;"
			}
		});

		stream.pipe(through(function(buffer) {
			Promise.resolve().then(function(){
				assert.equal(authHeader, undefined);
			}).then(done, done);
		}));
	});
});
