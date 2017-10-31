The *done-ssr/zones/debug* zone is used to debug applications when they timeout. This zone expects either a *can-zone/timeout* zone, or a Number of milliseconds before timing out (in which case it will create a *can-zone/timeout* itself).

```js
const Zone = require("can-zone");
const debug = require("done-ssr/zones/debug");

require("http").createServer(function(request, response){
	new Zone([
		debug(5000);
	]);
}).listen(8080);
```

# Signature

## debug(timeout)

Creates a debug zone using the provided *timeout*, in milliseconds:

```js
debug(5000)
```

## debug(timeoutZone)

Creates a debug zone, using the provided *can-zone/timeout* zone.

```js
const timeout = require("can-zone/timeout");

...

let timeoutZone timeout(5000);

new Zone([
	debug(timeoutZone)
])
```
