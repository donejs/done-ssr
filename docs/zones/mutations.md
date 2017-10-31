The *done-ssr/zones/mutations* zone creates the `data.mutations` stream, for which serialized DOM mutations are written. Usually you will want to use *done-ssr/zones/push-mutations* rather than this zone.

Use this zone if you want to handle the mutations yourself (pushing them to the browser and then applying the patches in the browser).

```js
const Zone = require("can-zone");
const mutations = require("done-ssr/zones/mutations");

require("donejs-spdy").createServer({
	key: ...,
	cert: ...
}, async function(request, response){

	let zone = new Zone([
		mutations()
	]);

	let runPromise = zone.run();

	zone.data.mutations.on('data', function(chunk){
		// Chunk is a string of DOM mutations
	});

	let stream = response.push("/mutation-stream", {
		status: 200,
		method: "GET",
		request: { accept: "*/*" },
		response: {
			"content-type": "text/plain"
		}
	});

	// This pushes mutations into this PUSH promise stream
	// it is up to you on how to handle this in the browser.
	zone.data.mutations.pipe(stream);

	response.end(zone.data.html);

}).listen(8081);
```

# Signature

## mutations()

This zone takes no arguments.

# Data properties

These are the can-zone *data properties* that the mutations stream either creates or consumes.

### Input

These are data properties that *done-ssr/zones/mutations* will use, if present.

#### zone.data.startMutations

A Promise, used to delay when the zone starts listening to DOM mutations. You might use this if you want to modify the document and do not want these modifications to be part of the mutation stream.

### Output

These are data properties the zone creates.

### zone.data.mutations

A Node.js [readable stream](https://nodejs.org/api/stream.html#stream_readable_streams) of DOM mutations. Pipe this into a writable stream.

##
