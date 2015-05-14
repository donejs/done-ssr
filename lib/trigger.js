
module.exports = function(doc, event){

	// Do cleanup here.
	function traverse(el){
		var cur = el.firstChild;
		while(cur) {
			can.trigger(cur, event);
			traverse(cur);
			cur = cur.nextSibling;
		}
	}

	var cur = doc.documentElement.firstChild;
	while(cur) {
		traverse(cur);
		can.trigger(cur, event);
		cur = cur.nextSibling;
	}
};
