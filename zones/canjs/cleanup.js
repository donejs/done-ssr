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
			var head = data.document.head;
			var body = data.document.body;

			// Do this some time later to prevent extra mutations
			// In the mutation stream
			later(function(){
				domMutate.removeChild.call(docEl, head);
				domMutate.removeChild.call(docEl, body);
			});
		}
	};
};
