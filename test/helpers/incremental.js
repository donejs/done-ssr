var domHelpers = require("./dom");
var he = require("he");
require('fast-text-encoding');
var MutationDecoder = require("done-mutation/decoder");

exports.findMutationDoc = function(node) {
	var node = domHelpers.find(node, n => {
		return n && n.getAttribute && n.getAttribute("id") === "donessr-iframe";
	});
	var srcdoc = node.getAttribute("srcdoc");
	var str = he.decode(he.decode(srcdoc));
	return domHelpers.dom(str);
}

exports.extractInstructionsURL = function(html) {
	var node = domHelpers.dom(html);
	var mutationDoc = exports.findMutationDoc(node);
	var preload = domHelpers.find(mutationDoc, n => {
		return n && n.getAttribute && n.getAttribute("rel") === "preload";
	});
	return preload && preload.getAttribute("href");
};

exports.decodeMutations = function(bytes) {
	var doc = domHelpers.dom("<html></html>").ownerDocument;
	var decoder = new MutationDecoder(doc);
	var mutations = Array.from(decoder.decode(bytes));
	return mutations;
};
