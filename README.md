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

## License

MIT
