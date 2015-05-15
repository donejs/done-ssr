[![Build Status](https://travis-ci.org/donejs/server-side-render.svg?branch=master)](https://travis-ci.org/donejs/server-side-render)
[![npm version](https://badge.fury.io/js/steal-server-side-render.svg)](http://badge.fury.io/js/steal-server-side-render)

# done-server-side-render

Server-side rendering for users of StealJS and CanJS.

## Usage

```js
var render = require("done-server-side-render")({
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


#### register(moduleName, type, assetMaker)

Register takes the moduleName to register, a type associated with it, and a function that when called returns an HTMLElement.

#### register(type, assetMaker)

If registering an asset not associated with a particular module, supply only the type and a function that when called returns an HTMLElement.

### asset (helper)

When rendering in Node, a special `asset` helper is included. This is used to append assets within your template:

```handlebars
<html>
	<head>
		{{asset "css"}}
	</head>
	<body>
		<can-import from="routes"/>

		...
	</body>
</html>
```

In this example, all CSS (either `<style>` or `<link>` elements depending on whether you are in development or production.

#### {{asset type}}

Specify the `type` to insert. Assets can be registered with `asset-register` (docs above). Types provided natively by JavaScriptMVC:

* **css**: Inserts a `<style>` or `<link>`
* **inline-cache**: If using the can.AppMap will insert data fetched as part of the page lifecycle.

## License

MIT
