var $ = require("jquery");

exports.createState = function(){
	return {};
};

exports.render = function(document){
	$("<title>").text("jQuery App").appendTo(document.head);
	var div = $("<div>").attr("id", "app").text("Hello world");
	$(document.body).append(div);
};
