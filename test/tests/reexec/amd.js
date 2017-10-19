define([], function(){
	var div = document.createElement("div");
	div.setAttribute("class", "content");
	div.textContent = "AMD Module";

	document.body.appendChild(div);
});
