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


});
