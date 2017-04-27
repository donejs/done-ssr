
module.exports = function(document, setDocument, domMutate){
	var curDoc = setDocument();
	setDocument(document);

	var docEl = document.documentElement;
	var head = document.head;
	var body = document.body;

	if(head) {
		domMutate.removeChild.call(docEl, head);
	}

	domMutate.removeChild.call(docEl, body);
	setDocument(curDoc);
};
