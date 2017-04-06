var path = require("path");
var assert = require("assert");
var ssr = require("../lib/");
var helpers = require("./helpers");
var through = require("through2");

describe("xhr async rendering", function() {
	this.timeout(10000);

	var render;
	var xhrOptions = {};

	before(function() {
		this.oldXHR = global.XMLHttpRequest;
		global.XMLHttpRequest = helpers.mockXHR('[1,2,3,4,5]', xhrOptions);

		render = ssr({
			config: "file:" + path.join(__dirname, "tests", "package.json!npm"),
			main: "xhr/index.stache!done-autorender"
		}, {
			auth: {
				cookie: 'feathers-jwt',
				domains: [
					'canjs.com',
					'example.org'
				]
			}
		});
	});

	after(function() {
		global.XMLHttpRequest = this.oldXHR;
	});

	it("works", function(done) {
		var didXhr = false;

		xhrOptions.beforeSend = function(xhr){
			var auth = xhr.getRequestHeader('authorization');
			assert.equal(auth, "Bearer foobar");
			didXhr = true;
		};

		var stream = render({
			url: '/',
			headers: {
				cookie: "feathers-jwt=foobar;"
			}
		});

		stream.pipe(through(function(buffer) {
			assert.ok(didXhr);
			done();
		}));
	});
});
