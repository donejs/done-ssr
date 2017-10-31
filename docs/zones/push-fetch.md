*done-ssr/zones/push-fetch*, when used on an HTTP/2 server, will initiate a PUSH promise for any URLs when using the [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API.

```js
const Zone = require("can-zone");
const pushFetch = require("done-ssr/zones/push-xhr");
const requests = require("done-ssr/zones/requests");
const app = require("./app");

require("donejs-spdy").createServer({
	key: ...,
	cert: ...
}, function(request, response){

	new Zone([
		requests(request),
		pushFetch(response)
	])
	.run(app);

}).listen(8081);
```

Where *app.js* looks like:

```js
module.exports = function(){
	let ul = document.createElement('ul');
	document.body.appendChild(ul);

	// In the browser this URL will be PUSHed
	fetch('/api/todos').then(res => res.json())
	.then(todos => {
		todos.forEach(todo => {
			let li = document.createElement('li');
			li.textContent = todo;
			ul.appendChild(li);
		});
	});
};
```

# Signature

## pushFetch(response)

*done-ssr/zones/push-fetch* expects a http(s) response object, which it uses to initiate the PUSH promise.
