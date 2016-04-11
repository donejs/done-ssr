// done-autorender attaches everything to the body
module.exports = function(doc){
	var body = doc.body;
	var innerBody = body.getElementsByTagName("body")[0];
	return innerBody || body;
};
