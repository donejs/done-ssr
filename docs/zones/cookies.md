The *done-ssr/zones/cookies* zone will set the `document.cookie` property. It must be used after a DOM zone.

```js
const Zone = require("can-zone");
const dom = require("done-ssr/zones/can-simple-dom");
const cookies = require("done-ssr/zones/cookies");

require("http").createServer(function(request, response){

	new Zone([
		dom(request),

		cookies(request, response)
	])

}).listen(8080);
```

The cookies zone will extract the cookies from the request and place them on the `document.cookie`, and then later on the `response.cookie`.
