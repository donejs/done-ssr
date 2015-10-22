var ssr = require("../../../lib");

var render = ssr({
	config: __dirname + "/package.json!npm"
});

render("/").then(function(result){
	console.log(result.html);
});
