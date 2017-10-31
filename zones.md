
# SSR zones

> Note that done-ssr's zones are not part of an official release yet, and must be used in the __zones__ branch.

**done-ssr** is built around zones. Zones provide a single context for all asynchronous tasks that happen within a request. To learn more about zones checkout [this introductory article](https://davidwalsh.name/can-zone).

done-ssr consists of several zones that help with commonly needed server-side rendering tasks such as creating a virtual DOM, and PUSHing (as in HTTP/2 PUSH) XHR and fetch requests.

## Use

Use the plugins provided by done-ssr in conjunction with [can-zone](https://github.com/canjs/can-zone). Here's a typical example:

```js
var Zone = require("can-zone");

var requests = require("done-ssr/zones/requests");
var dom = require("can-zone-jsdom")
var pushFetch = require("done-ssr/zones/push-fetch");
var pushImages = require("done-ssr/zones/push-images");
var app = require("./app");

require("spdy").createServer(options, function(request, response){
	var zone = new Zone([
		// Overrides XHR, fetch
		requests(request),

		// Sets up a DOM
		dom(request),

		pushFetch(response),
		pushImages(response)
	]);

	zone.run(app).then(function(data){
		// The full HTML after all async tasks are complete
		response.end(data.html);
	});
});
```

Where `app.js` looks like:

```js
module.exports = function(){
	// can-zone-jsdom provides a global `document`
	var main = document.createElement("main");
	var ul = document.createElement("ul");
	main.appendChild(ul);

	// This will be PUSHed
	var img = document.createElement("img");
	img.src = "/images/cat.png";
	main.appendChild(img);

	// This will be PUSHed
	fetch("/api/todos").then(res => res.json()).then(todos => {
		todos.forEach(todo => {
			var li = document.createElement("li");
			li.textContent = todo;
			ul.appendChild(li);
		});
	});
};
```

# Zones

done-ssr provides the following (expanding) list of zones:

* __[done-ssr/zones/requests](https://github.com/donejs/done-ssr/blob/master/docs/zones/requests.md)__: Provides XMLHttpRequest and fetch polyfills. Overrides requests so that they are made to the server handling the node.js Request. This zone collects the following:
  * __done-ssr/zones/xhr__: Overrides XMLHttpRequest, rerouting requests to the Node.js server running.
  * __done-ssr-zones/fetch__: Overrides fetch, rerouting requests to the Node.js server running.

* __[done-ssr/zones/push-fetch](https://github.com/donejs/done-ssr/blob/master/docs/zones/push-fetch.md)__: When using an HTTP/2 server like [spdy](https://github.com/spdy-http2/node-spdy) (support for http2 in Node 8 coming soon), will PUSH any fetches made to the server. This will speed up any repetitive requests that exist in the client.
* __[done-ssr/zones/push-xhr](https://github.com/donejs/done-ssr/blob/master/docs/zones/ush-xhr.md)__: When using an HTTP/2 server like [spdy](https://github.com/spdy-http2/node-spdy) (support for http2 in Node 8 coming soon), will PUSH any XHR requests made to the server. This will speed up any repetitive requests that exist in the client.
* __[done-ssr/zones/push-images](https://github.com/donejs/done-ssr/blob/master/docs/zones/push-images.md)__: Like the 2 above zones, but will PUSH images. So if your code adds images to the DOM like:

```js
var img = document.createElement("img");
img.src = "/images/cats.png";
document.body.appendChild(img);
```

Then the `/images/cat.png` will be PUSHed, speeding up the request that happens in the client. To use:

```js
var pushImages = require("done-ssr/zones/push-images");

var zone = new Zone([
	pushImages(response)
])
```
* __[done-ssr/zones/push-mutations](https://github.com/donejs/done-ssr/blob/master/docs/zones/requests.md)__: This is used internally by done-ssr's incremental rendering strategy. Use this if you want to skip waiting on the Zone to complete, but rather want to stream out mutations to the client as they happen.

This Zone (like the other PUSH zones) requires an HTTP/2 server.

```js
var Zone = require("can-zone");
var dom = require("done-ssr/zones/can-simple-dom");
var pushMutations = require("done-ssr/zones/push-mutations");
var app = require("./app");

require("spdy").createServer(options, function(request, response){
	var zone = new Zone([
		dom(request),

		pushMutations(response)
	]);

	// Mutations are PUSHed to /_donessr_instructions/{hash}.
	zone.run(app);

	// Send out the initial HTML, which includes the script to attach
	// to the mutations stream that is being sent out.
	response.end(zone.data.html);
});
```

* __[can-zone-jsdom](https://github.com/canjs/can-zone-jsdom)__: Uses [jsdom](https://www.npmjs.com/package/jsdom) to provide a global document. This should usually be the first plugin listed, as it is used by other zones like `done-ssr/zones/push-images`.
* __[done-ssr/zones/can-simple-dom](https://github.com/donejs/done-ssr/blob/master/docs/zones/can-simple-dom.md)__: Use [can-simple-dom](https://github.com/canjs/can-simple-dom) to provide a global `document` and `window`. This is like jsdom but is not spec compatible. It provides only a minimal DOM needed for most applications (and is the default DOM used by done-ssr).

* __done-ssr/zones/canjs](https://github.com/donejs/done-ssr/blob/master/docs/zones/requests.md)__: Makes sure globals within a canjs application are configured for each zone task, and sets the `response.statusCode` when `route.data.statusCode` is a number.
