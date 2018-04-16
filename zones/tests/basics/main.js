
module.exports = function(){
	var main = document.createElement("main");
	var ul = document.createElement("ul");
	main.appendChild(ul);

	var statusSpan = document.createElement("span");
	statusSpan.className = "status";
	main.appendChild(statusSpan);

	var img = document.createElement("img");
	img.src = "/images/cat.png";
	main.appendChild(img);

	fetch("/api/todos").then(res => {
		statusSpan.appendChild(document.createTextNode(res.ok ? "OK" : "BAD"));

		return res.json();
	}).then(todos => {
		todos.forEach(todo => {
			var li = document.createElement("li");
			li.appendChild(document.createTextNode(todo));
			ul.appendChild(li);
		});
	})
	.then(null, err => console.log(err));

	var cartDiv = document.createElement("div");
	cartDiv.setAttribute("id", "cart");
	main.appendChild(cartDiv);

	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/api/cart", true);
	xhr.onload = function(){
		var data = JSON.parse(xhr.responseText);
		cartDiv.textContent = `Count: ${data.count}`;
	};
	xhr.send();

	// Verify that the `window` is the global object.
	var realGlobal = (function(){ return this; })();
	var areTheSame = realGlobal === window;
	var globalDiv = document.createElement("div");
	globalDiv.setAttribute("id", "the-global");
	globalDiv.appendChild(document.createTextNode(areTheSame.toString()));
	main.appendChild(globalDiv);

	document.body.appendChild(main);
};
