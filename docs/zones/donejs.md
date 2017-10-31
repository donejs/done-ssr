The *done-ssr/zones/donejs* zone is used to set up *done-ssr/zones/steal* and *done-ssr/zones/canjs*. This prevents users from needing to configure each of those zones individually.

```js
const Zone = require("can-zone");
const donejs = require("done-ssr/zones/donejs");

require("http").createServer(function(request, response){

	new Zone([
		donejs({
			config: __dirname + "/package.json!npm"
		}, response)
	]);

}).listen(8080);
```

# Signature

## donejs(stealConfig, response)

Since this zone mainly just combines the steal and canjs zones, it needs each of those zones arguments.
