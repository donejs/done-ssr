require("es6-promise").polyfill();
var assert = require("assert");
var Zone = require("can-zone");

var xhrZone = require("./xhr");

var helpers = require("../../test/helpers");

describe("zones/xhr", function(){
	describe("when successful", function(){
		beforeEach(function(){
			global.doneSsr = {
				request: {}
			};

			this.oldXHR = global.XMLHttpRequest;
			global.XMLHttpRequest = helpers.mockXHR('["a", "b", "c"]');

			this.zone = new Zone({
				plugins: [xhrZone]
			});
		});

		afterEach(function(){
			global.XMLHttpRequest = this.oldXHR;
		});

		it("Works", function(done){
			this.zone.run(function(){
				var xhr = new XMLHttpRequest();
				xhr.open("GET", "foo.bar");
				xhr.onload = function(){
					var data = JSON.parse(xhr.responseText);
					Zone.current.data.things = data;
				};
				xhr.send();
			}).then(function(data){
				assert.equal(data.things.length, 3, "got the xhr response");
				done();
			}, done);
		});
	});

	describe("when errored", function(){
		beforeEach(function(){
			global.doneSsr = {
				request: {}
			};

			this.oldXHR = global.XMLHttpRequest;
			global.XMLHttpRequest = helpers.mockXHR(null, {
				error: true
			});

			this.zone = new Zone({
				plugins: [xhrZone]
			});
		});

		afterEach(function(){
			global.XMLHttpRequest = this.oldXHR;
		});

		it("Works", function(done){
			this.zone.run(function(){
				var xhr = new XMLHttpRequest();
				xhr.open("GET", "foo.bar");
				xhr.onerror = function(){
					Zone.current.data.error = true;
				};
				xhr.send();
			}).then(function(data){
				assert.equal(data.error, true, "it errored");
				done();
			}, done);
		});
	});

	describe("when proxy-options is not defined", function(){
		beforeEach(function(){
			global.doneSsr = {
				request: {
					url: "http://public-alias/page"
				}
			};

			this.oldXHR = global.XMLHttpRequest;
			global.XMLHttpRequest = helpers.mockXHR('["a", "b", "c"]');

			var options = {
			};
			this.zone = new Zone({
				plugins: [xhrZone(options)]
			});
		});

		afterEach(function(){
			global.XMLHttpRequest = this.oldXHR;
		});

		it("should prepend request-baseUri to xhr-request", function(done){
			this.zone.run(function(){
				var xhr = new XMLHttpRequest();
				xhr.open("GET", "/api/get_data");
				xhr.onload = function(){
					var data = JSON.parse(xhr.responseText);
					Zone.current.data.things = data;
				};
				xhr.send();
			}).then(function(data){
				assert.equal(data.xhr.data[0].request.url, "/api/get_data", "request-baseUri is not prepended to xhr-request");

				// when code in 'polyfills/xhr.js' is excuted...
				//assert.equal(data.xhr.data[0].request.url, "http://public-alias/api/get_data", "request-baseUri is prepended to xhr-request by 'polyfills/xhr.js'");
				done();
			}, done);
		});
	});
	describe("when proxy-options is defined", function(){
		beforeEach(function(){
			global.doneSsr = {
				request: {
					url: "http://public-alias/page"
				}
			};

			this.oldXHR = global.XMLHttpRequest;
			global.XMLHttpRequest = helpers.mockXHR('["a", "b", "c"]');

			var options = {
				proxy: "http://internal-alias/api",
				proxyTo: "/api"	// 'proxyTo' defaults to '/api' by 'done-serve'-module
			};
			this.zone = new Zone({
				plugins: [xhrZone(options)]
			});
		});

		afterEach(function(){
			global.XMLHttpRequest = this.oldXHR;
		});

		it("should prepend 'proxy' to xhr-request", function(done){
			this.zone.run(function(){
				var xhr = new XMLHttpRequest();
				xhr.open("GET", "/api/get_data");
				xhr.onload = function(){
					var data = JSON.parse(xhr.responseText);
					Zone.current.data.things = data;
				};
				xhr.send();
			}).then(function(data){
				assert.equal(data.xhr.data[0].request.url, "http://internal-alias/api/get_data", "'proxy' is prepended to xhr-request");
				done();
			}, done);
		});
	});


});
