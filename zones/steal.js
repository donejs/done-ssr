var Steal = require("steal");

var mains = new Map();

module.exports = function(cfg){
	if(typeof cfg === "string") {
		cfg = { main: cfg };
	}

	var steal = Steal.clone();
	var loader = global.System = steal.System;

	var nodeEnv = process.env.NODE_ENV || "development";
	loader.config({
		env: "server-" + nodeEnv
	});

	steal.config(cfg);

	return function(data){
		return {
			created: function(){
				data.steal = steal;
			}
		};
	};
};
