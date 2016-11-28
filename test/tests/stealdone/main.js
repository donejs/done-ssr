module.exports = function(request){
	var def = typeof steal.done();
	var span = document.createElement("span");
	span.innerHTML = def;

	document.body.appendChild(span);
};
