*done-ssr/zones/push-xhr*, when used within an HTTP/2 server, will establish a PUSH promise for all requests that are made with the `XMLHttpRequest` API.

```js
const Zone = require("can-zone");
const pushXHR = require("done-ssr/zones/push-xhr");
const requests = require("done-ssr/zones/requests");
const app = require("./app");

require("donejs-spdy").createServer({
	key: ...,
	cert: ...
}, function(request, response){

	new Zone([
		requests(request),
		pushXHR(response)
	])
	.run(app);

}).listen(8081);
```

Where *app.js* looks like:

```js
module.exports = function(){
	let xhr = new XMLHttpRequest();
	xhr.open('/api/todos');
	xhr.onload = function(){
		let todos = JSON.parse(xhr.responseText);
		// todo do something with the todos
	};
	xhr.send();
};
```

This will establish a PUSH promise for `/api/todos`. If the browser requests this URL (for example if you are running the same code in the browser), it will already be available to it in the PUSH cache.

# Signature

## pushXHR(response)

push-xhr needs the server's *response* object in order to set up the PUSH promise.
