var copy = require("copy-dir").sync;

var modules = [
	"can",
	"can-simple-dom",
	"micro-location",
	"simple-html-tokenizer",
	"jquery",
	"done-autorender",
	"can-zone",
	"can-fixture",
	"can-set"
];

modules.forEach(function(name){
	try {
		copy("node_modules/" + name, "test/tests/node_modules/" + name);
	} catch(err) {
		// In NPM 2 it will throw for modules which are nested, we can ignore
	}
});

var jModules = [
	"can",
	"jquery",
	"can-simple-dom",
	"micro-location",
	"simple-html-tokenizer"
];

jModules.forEach(function(name){
	try {
		copy("node_modules/" + name, "test/tests/jquery/node_modules/" + name);
	} catch(err) {}
});

