
module.exports = function(data){
	// Get a module either from `data.modules`, if loaded by Steal,
	// Or require it directly from Node
	function getEither(propName, moduleName) {
		return (data.modules && data.modules[propName]) || require(moduleName);
	}

	var getGlobals = getEither.bind(null, "globals", "can-globals");

	var oldLocation, oldDocument;

	function setCanGlobals() {
		var globals = getGlobals();

		oldLocation = globals.getKeyValue("location");
		globals.setKeyValue("location", data.window.location);

		oldDocument = globals.getKeyValue("document");
		globals.setKeyValue("document", data.window.document);
	}

	return {
		afterStealDone: setCanGlobals,
		beforeTask: setCanGlobals,
		afterTask: function(){
			var globals = getGlobals();

			var document = oldDocument !== data.window.document ? oldDocument : undefined;
			var location = oldLocation !== data.window.location ? oldLocation : undefined;
			globals.setKeyValue("location", location);
			globals.setKeyValue("document", document);
		},
		ended: function() {
			function teardown(globals) {
				globals.deleteKeyValue("document");
				globals.deleteKeyValue("location");
			}

			teardown(getGlobals());
			teardown(require("can-globals"));
		}
	};
};
