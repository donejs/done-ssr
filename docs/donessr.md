@module {Function} done-ssr.module done-ssr
@parent done-ssr.node

Create a [done-ssr.renderer] that, when called, renders the page for a given route.

@signature `ssr(config)`

```js
var ssr = require("done-ssr");

var render = ssr({
	config: __dirname + "/package.json!npm"
});
```

@param {Object} [config] Configuration options that are a [SystemConfig](http://stealjs.com/docs/steal-tools.SystemConfig.html).

@return {done-ssr.renderer} A renderer function that can be used to render a given route.
