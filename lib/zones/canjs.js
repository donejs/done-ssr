
// TODO A lot more stuff to do here.

module.exports = function(){
	return function(data){
		return {
			ended: function(){
				var setDocument = data.canjs ? data.canjs.DOCUMENT :
					require("can-util/dom/document/document");
				var domMutate = data.canjs ? data.canjs.domMutate :
					require("can-util/dom/mutate/mutate");

				cleanup(window.document, setDocument, domMutate);
			}
		}
	};
};

function cleanup(document, setDocument, domMutate){
	var setDoc = setDocument || Function.prototype; // noop

	var curDoc = setDoc();
	setDoc(document);

	var docEl = document.documentElement;
	var head = document.head;
	var body = document.body;

	if(head) {
		domMutate.removeChild.call(docEl, head);
	}

	domMutate.removeChild.call(docEl, body);
	setDoc(curDoc);
};
