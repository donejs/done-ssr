var mochas = require("spawn-mochas");

mochas([
	"unit_test.js",
	"async_test.js",
	"cookie_test.js",
	"token_test.js",
	"leakscope_test.js",
	"plainjs_test.js",
	"progressive_test.js",
	"test_envs.js",
	"xhr_test.js",
	"import_empty_test.js",
	"timeout_test.js",
	"startup_err_test.js",
	"fixture_test.js",
	"nojquery_test.js",
	"define_map_test.js",
	"define_test.js"
], __dirname);
