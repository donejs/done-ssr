var ssr = require("../../../lib"); // same as require("can-ssr");

var render = ssr();

render("/").then(function(result){
	console.log(result.html);
});
