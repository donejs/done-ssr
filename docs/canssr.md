@module {Function} can-ssr.module can-ssr
@parent can-ssr.node

Create a [can-ssr.renderer] that, when called, renders the page for a given route.

@signature `canSsr(config)`

```js
var canSsr = require("can-ssr");

var render = canSsr({
	config: __dirname + "/package.json!npm"
});
```

@param {Object} [config] Configuration options that are a [SystemConfig](http://stealjs.com/docs/steal-tools.SystemConfig.html).

@return {can-ssr.renderer} A renderer function that can be used to render a given route.
