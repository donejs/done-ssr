
module.exports = function(data){
	// Get a module either from `data.modules`, if loaded by Steal,
	// Or require it directly from Node
	function getEither(propName, moduleName) {
		return (data.modules && data.modules[propName]) || require(moduleName);
	}

	var getLocation = getEither.bind(null, "LOCATION", "can-globals/location/location");
	var getDocument = getEither.bind(null, "DOCUMENT", "can-globals/document/document")

	var oldLocation, oldDocument;

	return {
		beforeTask: function(){
			var LOCATION = getLocation();
			var DOCUMENT = getDocument();

			oldLocation = LOCATION();
			LOCATION(window.location);

			oldDocument = DOCUMENT();
			DOCUMENT(window.document);
		},
		afterTask: function(){
			getLocation()(oldLocation);
			getDocument()(oldDocument);
		}
	};
};
