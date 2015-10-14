
exports.dom = function(html){
	var doc = new document.constructor();
	var div = doc.createElement("div");
	div.innerHTML = html;

	return div.firstChild;
};

exports.traverse = function(node, callback){
	var cur = node.firstChild;

	while(cur) {
		callback(cur);
		exports.traverse(cur, callback);
		cur = cur.nextSibling;
	}
};

exports.count = function(node, callback){
	var count = 0;
	exports.traverse(node, function(){
		var truthy = callback.apply(this, arguments);
		if(truthy) {
			count++;
		}
	});
	return count;
};
