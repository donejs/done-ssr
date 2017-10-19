require("./main.css");

module.exports = function(){
	var main = document.createElement("main");
	main.appendChild(document.createTextNode("hello world"));
	document.body.appendChild(main);
};
