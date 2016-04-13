// Using can-simple-dom to create a new document
exports.factory = function(){
	var doc = new document.constructor();

	return {
		document: doc
	};
};
