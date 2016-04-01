var mochas = require("spawn-mochas");

mochas([
	"unit_test.js",
	"async_test.js",
	"cookie_test.js",
	"jquery_test.js",
	"leakscope_test.js",
	"plain_state_test.js",
	"plainjs_test.js",
	"progressive_test.js",
	"test_envs.js",
	"xhr_test.js"
], __dirname);
