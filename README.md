[![Build Status](https://travis-ci.org/canjs/can-ssr.svg?branch=master)](https://travis-ci.org/canjs/can-ssr)
[![npm version](https://badge.fury.io/js/can-ssr.svg)](http://badge.fury.io/js/can-ssr)

# can-ssr

Server-side rendering for CanJS.

## Server

To start a full server that hosts your application run:

> npm install can-ssr
> node_modules/.bin/can-server --port 3030

In your application folder. To proxy an API add `--proxy-to url`.

## Usage

```js
var render = require("can-ssr")({
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
