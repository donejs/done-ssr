module.exports = function(data){
	var later = setTimeout;

	function getEither(propName, moduleName) {
		return (data.modules && data.modules[propName]) || require(moduleName);
	}

	var getDomMutate = getEither.bind(null, "domMutate", "can-dom-mutate/node");

	return {
		ended: function(){
			var domMutate = getDomMutate();

			var docEl = data.document.documentElement;

			// Run the removal within the zone so that the globals point to our globals.
			var removeDocumentElement = this.wrap(function() {
				domMutate.removeChild.call(data.document, docEl);
			});

			// Do this some time later to prevent extra mutations
			// In the mutation stream
			later(removeDocumentElement);
		}
	};
};
