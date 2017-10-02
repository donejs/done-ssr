var makeDocument = require("can-vdom/make-document/make-document");

module.exports = function(){
	return {
		created: function(){
			if(typeof doneSsr !== "undefined" && !doneSsr.globalDocument) {
				doneSsr.globalDocument = makeDocument();
			}
		}
	};
};
