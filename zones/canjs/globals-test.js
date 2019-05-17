var assert = require("assert");
var Zone = require("can-zone");
var globalsZone = require("./globals");
var globals = require("can-globals");
var noop = Function.prototype;

describe("canjs globals zone plugin", function() {
	it("Removes the global location and document when the zone ends", function(done) {
		var document = {};
		var location = {};
		globals.setKeyValue("document", document);
		globals.setKeyValue("location", location);

		var zone = new Zone([
			{
				created() {
					this.data.window = {
						document: document,
						location: location
					};
				}
			},
			globalsZone
		]);

		zone.run(noop)
		.then(function(){
			assert.equal(globals.getKeyValue("document"), undefined, "no document");
			assert.equal(globals.getKeyValue("location"), undefined, "no location");
		})
		.then(done, done);
	});
});
