module.exports = function(){

	var shivUrl, tags, doc;

	return {
		beforeTask: function(){
			if(!shivUrl) {
				var loader = doneSsr.loader;
				var path = loader._nodeRequire("path");
				var shivPath = path.join(__dirname,
										 "/../../scripts/html5shiv.min.js");
				var loaderBasePath = loader.baseURL.replace("file:", "");
				shivUrl = path.relative(loaderBasePath, shivPath)
					.replace(/\\/g, "/");

			}
			if(!tags && typeof can && typeof can.view.callbacks) {
				tags = can.view.callbacks._tags;
			}
			if(!doc) {
				doc = document;
			}
		},

		ended: function(){
			var elements = Object.keys(tags)
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

			var head = doc.body.getElementsByTagName("head")[0] || doc.head;
			head.insertBefore(comment, head.lastChild);
		}
	};
};
