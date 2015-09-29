var loader = require("@loader");
var nodeRequire = loader._nodeRequire;
var path = nodeRequire("path");

// Register the html5-upgrade asset type
module.exports = function(register){
	var shivPath = path.join(__dirname, "/../../scripts/html5shiv.min.js");
	var loaderBasePath = loader.baseURL.replace("file:", "");
	var shivUrl = path.relative(loaderBasePath, shivPath).replace(/\\/g, "/");

	register("html5shiv", function(){
		var elements = Object.keys(loader.global.can.view.callbacks._tags)
			.filter(function(tagName) {
				return tagName.indexOf("-") > 0;
			});
		var comment = document.createComment(
			"[if lt IE 9]>\n" +
			"\t<script src=\""+ shivUrl + "\"></script>" +
			"\t<script>\n\t\thtml5.elements = \"" + elements.join(" ") +
				"\";\nhtml5.shivDocument();\n\t</script>" +
			"<![endif]"
		);
		return comment;
	});

};
