var $ = require("jquery");

exports.createState = function(){
	return {};
};

exports.render = function(document){
	$("<title>").text("jQuery App").appendTo(document.head);

	var app = $("<div>").attr("id", "app");
	$("<div>").text("Hello from the present").appendTo(app);
	$(document.body).append(app);

	setTimeout(function(){
		$("<div>").text("Hello from the future").appendTo(app);
	}, 200);
};
