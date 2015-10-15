var assert = require("assert");
var path = require("path");
var spawn = require("child_process").spawn;

describe("can-serve cli tests", function(){
	this.timeout(30000);

	var isWin = /^win/.test(process.platform);
	var platformExt = function(p) {
		return p + (isWin ? ".cmd" : "");
	};

	var canServeBin = platformExt(path.join(__dirname, "..", "bin", "can-serve"));
	var stealToolsBin = platformExt(path.join(__dirname, "..", "node_modules",
								  ".bin", "steal-tools"));

	describe("--develop", function(){
		beforeEach(function(){
			this.pwd = process.cwd();
			process.chdir(path.join(__dirname, "tests"));
		});

		afterEach(function(){
			process.chdir(this.pwd);
		});

		it("starts up web and live-reload servers", function(done){
			var child = spawn(canServeBin, [
				"--develop",
				"--steal-tools-path",
				stealToolsBin,
				"--port",
				"8085"
			]);

			// Keeps track of the web server and live-reload server starting.
			var partsStarted = 0;

			child.stdout.setEncoding("utf8");

			child.stdout.on("data", checkMessage);
			child.stderr.on("data", checkMessage);

			function checkMessage(msg){
				if(/can-serve starting/.test(msg)) {
					assert(true, "web server started");
					partsStarted++;
				}
				if(/Live-reload server/.test(msg)) {
					assert(true, "live-reload started");
					partsStarted++;
				}
				if(partsStarted === 2) {
					child.kill();
					done();
				}
			}
		});
	});
});
