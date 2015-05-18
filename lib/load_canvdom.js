var Steal = require("steal");

module.exports = function(){
	var steal = Steal.clone();
	steal.config({
		config: __dirname + "/../package.json!npm",
		main: "can/util/vdom/vdom"

	});
	var loader = steal.System;

	return steal.import(loader.main);
};
