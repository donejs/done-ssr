var spawn = require("child_process").spawn;

// Node 0.10.0 doesn't support Symbol which the websocket server needs,
// so we won't try to run the tests on it.
if(typeof Symbol === "undefined") {
	process.exit(0);
}

var popts = { stdio: "inherit" };
var lchild = spawn("node", ["test/tests/live/live_server"], popts);

setTimeout(function(){
	var child = spawn("mocha", ["test/live_test"], popts);

	child.on("exit", function(code){
		lchild.kill();
		process.exit(code);
	});

}, 3000);
