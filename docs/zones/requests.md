Enables polyfills for the XMLHttpRequest, fetch, and WebSocket APIs. Enables routing server-relative URLs such as `/api/todos` to resolve as `http://example.com/api/todos`.

```js
var requests = require("done-ssr/zones/requests");
var Zone = require("can-zone");

require("http").createServer(function(request, response){

	new Zone([
		requests(request)
	])

}).listen(8080);
```

# Signature

## requests(request, options)

Takes an [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage) (commonly called the __request__ object) and optionally an __options__ object with the shape of:

* __options.auth.cookie__: Specifies a cookie to include with API requests.
* __optiosn.auth.domains__: Specifies an Array of domains for which the *options.auth.cookie** will be set for.
