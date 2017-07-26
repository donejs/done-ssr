
module.exports = function(document, setDocument, domMutate){
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
