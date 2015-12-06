var $ = require("jquery");
var waitData = require("can-wait/waitfor").waitData;

exports.createState = function(){
	return {};
};

exports.render = function(document){
	$("<title>").text("jQuery App").appendTo(document.head);

	var app = $("<div>").attr("id", "app");
	$("<div>").text("Hello from the present").appendTo(app);
	$("body").append(app);

	// Verify we can use jQuery in a more normal way
	waitData({ app: $("#app").length });

	setTimeout(function(){
		$("<div>").text("Hello from the future").appendTo(app);
	}, 200);
};
