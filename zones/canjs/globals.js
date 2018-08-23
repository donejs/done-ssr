
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

			globals.setKeyValue("location", oldLocation);
			globals.setKeyValue("document", oldDocument);
		},
		end: function() {
			function teardown(globals) {
				globals.deleteKeyValue("document");
				globals.deleteKeyValue("location");
			}

			teardown(getGlobals());
			teardown(require("can-globals"));
		}
	};
};
