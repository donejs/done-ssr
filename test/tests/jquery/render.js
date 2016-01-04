var ssr = require("../../../lib");

var render = ssr();

render("/").then(function(result){
	console.log(result.html);
});
