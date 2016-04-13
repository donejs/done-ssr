var assert = require("assert");
var ssr = require("../lib/index");

describe("ssr.dom", function(){
	beforeEach(function(){
		this.oldFactory = ssr.polyfill.factory;
	});

	afterEach(function(){
		ssr.polyfill.factory = this.oldFactory;
	});

	it("Takes a function", function(){
		assert.doesNotThrow(function(){
			ssr.dom(function(){});
		}, "takes a function");

		assert.throws(function(){
			ssr.dom("foo");
		}, Error, "Must be a function");
	});

	it("Returns a factory function that creates the dom", function(){
		var factory = ssr.dom(function(){});
		assert.equal(typeof factory, "function", "Returned the factory function");
	});

	it("Returns a factory if no arguments are provided", function(){
		var factory = ssr.dom();
		assert.equal(typeof factory, "function", "Still returned the factory");
	});

	describe("DOM factory", function(){
		it("Throws if document is omitted", function(){
			var factory = ssr.dom(function(){});

			assert.throws(function(){
				factory();
			}, Error, "Factory must return a document");
		});

		it("Returns the dom the factory creates", function(){
			var factory = ssr.dom(function(){
				return {
					document: {}
				};
			});

			assert.doesNotThrow(function(){
				factory();
			}, "Returned a document");

			var dom = factory();
			assert.ok(dom.document, "Has a document");
		});
	});

	describe("Default factory", function(){
		beforeEach(function(){
			var test = this;
			test.globalDocument = global.document;

			global.document = {
				constructor: function(){
					test.calledGlobalDoc = true;
				}
			};
		});

		afterEach(function(){
			this.calledGlobalDoc = false;
			global.document = this.globalDocument;
		});

		it("Creates a new instance of the global document", function(){
			var factory = ssr.dom();
			factory();

			assert.ok(this.calledGlobalDoc, "Default provider called the global document");
		});
	});
});
