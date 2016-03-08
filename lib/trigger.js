/*global $:false */
module.exports = function(doc, event){

	// Do cleanup here.
	function traverse(el){
		var cur = el.firstChild;
		while(cur) {
			trigger(cur, event);
			traverse(cur);
			cur = cur.nextSibling;
		}
	}

	var cur = doc.documentElement.firstChild;
	while(cur) {
		traverse(cur);
		trigger(cur, event);
		cur = cur.nextSibling;
	}
};

function trigger(el, event){
	if(typeof can !== "undefined" && can.trigger) {
		can.trigger(el, event);
	} else if(typeof $ === "function") {
		$(el).trigger(event);
	}
}
