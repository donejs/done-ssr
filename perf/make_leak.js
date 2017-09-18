var ssr = require("../lib/");
var helpers = require("../test/helpers");
var assert = require("assert");
var path = require("path");
var through = require("through2");


global.XMLHttpRequest = helpers.mockXHR(
	'[ { "a": "a" }, { "b": "b" } ]');

var render = ssr({
	config: "file:" + path.join(__dirname, "..", "test", "tests", "package.json!npm"),
	main: "async/index.stache!done-autorender"
});

var renderThen = function(pth){
	return new Promise(function(resolve, reject){
		var stream = through(function(buffer){
			resolve(buffer);
		});
		stream.on("error", reject);
		render(pth).pipe(stream);
	});
};

var i = 100;
next();

function next() {

	if(i === 0) {
		return;
	}

	i--;
	renderThen("/").then(next);
}
