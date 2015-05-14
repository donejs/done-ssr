[![Build Status](https://travis-ci.org/canjs/steal-server-side-render.svg?branch=master)](https://travis-ci.org/canjs/steal-server-side-render)
[![npm version](https://badge.fury.io/js/steal-server-side-render.svg)](http://badge.fury.io/js/steal-server-side-render)

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

`register(moduleName, type, assetMaker)`

Register takes the moduleName to register, a type associated with it, and a function that when called returns an HTMLElement.

## License

MIT
