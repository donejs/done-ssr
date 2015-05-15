var path = require("path");

var render = require("../lib/main")({
	config: __dirname + "/tests/package.json!npm",
	main: "progressive/index.stache!",
	paths: {
		"$css": path.resolve(__dirname + "/tests/less_plugin.js")
	}
});

render("/orders").then(function(html){
	console.log(html);
});
