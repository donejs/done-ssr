
module.exports = function(){
	var msg = document.createElement("div");
	msg.setAttribute("id", "msg");
	msg.appendChild(document.createTextNode("Hello World"));
	document.body.appendChild(msg);
};
