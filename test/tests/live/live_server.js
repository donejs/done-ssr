var path = require("path");
var spawn = require("child_process").spawn;

var popts = { stdio: "inherit" };

process.chdir("test/tests/live");

var canServe = path.resolve(__dirname + "/../../../bin/can-serve");
var lrTest = path.resolve(__dirname + "/../../../node_modules/.bin/live-reload-test");

var cchild = spawn(canServe, ["--main", "index.stache!done-autorender", "--port",
	"8787"], popts);
var lchild = spawn(lrTest, ["--main", "index.stache!done-autorender"], popts);

process.on("exit", function(){
	cchild.kill();
	lchild.kill();
});
