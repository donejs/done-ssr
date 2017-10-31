The *done-ssr/zones/push-mutations* zone is used for incremental rendering. It initiates a PUSH promise on the HTTP/2 connection, and pushes out DOM mutations that will be handled by a small client-side script that is injected into the page.

```js
const Zone = require("can-zone");
const dom = require("done-ssr/zones/can-simple-dom");
const pushMutations = require("done-ssr/zones/push-mutations");
const app = require("./app");

require("donejs-spdy", {
	key: ...,
	cert: ...
}, function(request, response){

	let zone = new Zone([
		dom(request),

		pushMutations(response/* , url */)
	]);

	zone.run(app);
	response.end(zone.data.html);

}).listen(8081);
```

This will establish a PUSH promise for DOM mutations. These mutations will be streamed to the browser and applied in patches by a small client-side script.

# Signature

## pushMutations(response, url)

This zone expects a *response* object, which is used to initiate the PUSH promise.

Optionally you can provide a *url* string, the URL that will be used for the mutations stream. By default pushMutations will create a URL that is unlikely to conflict with one your app uses; in the form of `"/_donessr_instructions/" + Date.now()`
