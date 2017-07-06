var assert = require("assert");
var traceBundles = require("./index");

describe("asset-register", function(){
	it("adds a bundle to 'bundles'", function(){
		class Loader {
			constructor() {
				this.loads = Object.create(null);
				this.bundles = {
					"bundle-a": ["child-a"]
				};
			}

			normalize(name) {
				return Promise.resolve(name);
			}

			set(name, module){
				this.loads[name] = module;
			}

			newModule(def) {
				return def;
			}
		}
		var loader = new Loader();

		var bundleHelpers = traceBundles(loader);

		// This should add the "bundle-a" bundle
		loader.loads["asset-register"].default("bundle-a");
		
		assert.equal(Object.keys(bundleHelpers.bundles).length, 2,
			"There are two bundles currently");
	});
});
