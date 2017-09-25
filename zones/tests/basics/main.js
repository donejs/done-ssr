
module.exports = function(){
	var main = document.createElement("main");
	var ul = document.createElement("ul");
	main.appendChild(ul);

	var img = document.createElement("img");
	img.src = "/images/cat.png";
	main.appendChild(img);

	fetch("/api/todos").then(res => res.json()).then(todos => {
		todos.forEach(todo => {
			var li = document.createElement("li");
			li.textContent = todo;
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

	document.body.appendChild(main);
};
