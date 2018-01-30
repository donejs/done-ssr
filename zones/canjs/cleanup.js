module.exports = function(data){

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

			domMutate.removeChild.call(docEl, head);
			domMutate.removeChild.call(docEl, body);
		}
	};
};
