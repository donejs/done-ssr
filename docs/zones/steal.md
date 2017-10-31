Enables loading an application that depends on the steal module loader.

```js
var Zone = require("can-zone");
var steal = require("done-ssr/zones/steal");

require("http").createServer(function(request, response){
	new Zone([
		steal({
			config: __dirname + "/package.json!npm",
			// Other steal configuration here
		})
	])
}).listen(8080);
```

Your main can be defined one of two ways, it can either export a function that will be re-executed on each request, or the body of the main itself will re-excute. Export a function if you need to set up side-effects that happen only once.

__main.js__

```js
const Framework = require("my-framework");

module.exports = function(){
	let app = new Framework();
	app.render(document.body);
}
```

*or*

```js
const Framework = require("my-framework");

let app = new Framework();
app.render(document.body);
```

# Signature

## steal(stealConfig)

Takes a steal [configuration object](https://stealjs.com/docs/config.config.html), like those you provide to steal-tools or done-ssr.
