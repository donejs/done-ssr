# steal-server-side-render

Server-side rendering for users of StealJS and CanJS.

## Usage

```js
var render = require("steal-server-side-render")({
  config: __dirname + "/public/package.json!npm",
  main: "index.stache!"
});

render("/orders").then(function(html){
  // Do something with `html`
});
```

## API

### asset-register

A module used to register assets:

```js
var register = require("asset-register");

register("module/name", "css", function(){
	return HTMLElement;
});
```

## License

MIT
