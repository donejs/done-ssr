var nodeLists = require("can-view-nodelist");
module.exports = function(data){
	var later = setTimeout;

	function getEither(propName, moduleName) {
		return (data.modules && data.modules[propName]) || require(moduleName);
	}

	var getDomMutate = getEither.bind(null, "domMutate", "can-dom-mutate/node");
	var getNodeLists = getEither.bind(null, "nodeLists", "can-view-nodelist");
	return {
		ended: function(){
			var domMutate = getDomMutate();
			var nodeLists = getNodeLists();

			var docEl = data.document.documentElement;

			// Run the removal within the zone so that the globals point to our globals.
			var removeDocumentElement = this.wrap(function() {
				if(data.nodeList) {
					nodeLists.unregister(data.nodeList);
				}

				var newDocEl = data.document.createElement("html");
				domMutate.replaceChild.call(data.document, newDocEl, docEl);
			});

			// Do this some time later to prevent extra mutations
			// In the mutation stream
			later(removeDocumentElement);
		}
	};
};
