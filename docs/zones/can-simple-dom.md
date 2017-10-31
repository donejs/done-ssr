Provides a simple DOM interface for applications. [can-simple-dom](https://github.com/canjs/can-simple-dom) doesn't attempt to be fully standards complaint, but rather to provide the basic interfaces that most applications need. If you need a more complaint DOM, use [can-zone-jsdom](https://github.com/canjs/can-zone-jsdom).

```js
const Zone = require("can-zone");
const dom = require("done-ssr/zones/can-simple-dom");

require("http").createServer(async function(request, response){

	let zone = new Zone([
		dom(request)
	]);

	function app() {
		let div = document.createElement("div");
		div.textContent = "Hello world!";
		document.body.appendChild(div);
	}

	let {html} = await zone.run();
	response.end(html);

}).listen(8080);
```

# Signature

## dom(request)

The *can-simple-dom* zone requests a request object. It uses this to set up a few things, including the `window.location` and `navigator.language`.
