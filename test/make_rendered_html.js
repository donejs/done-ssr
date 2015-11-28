var path = require("path");
var ssr = require("../lib");
var assert = require("assert");

var render = ssr({
	config: __dirname + "/tests/package.json!npm",
	main: "progressive/index.stache!done-autorender",
	paths: {
		"$css": path.resolve(__dirname + "/tests/less_plugin.js")
	}
});

describe('renders html programatically', function() {
	it('works', function() {
		return render("/orders").then(function(result) {
			assert.deepEqual(Object.keys(result), ['state', 'html']);
			assert.equal(result.state.attr('statusCode'), 200);

			var hasOrderHistory = result.html.indexOf('<order-history>') !== -1;
			assert(hasOrderHistory, 'it should render order history page');
		});
	});
});
