<!--
@page can-ssr
@group can-ssr.node 0 Node
@group can-ssr.client 1 Client
@group can-ssr.helpers 2 Helpers
@group can-ssr.assets 3 Assets
-->

[![Build Status](https://travis-ci.org/canjs/can-ssr.svg?branch=master)](https://travis-ci.org/canjs/can-ssr)
[![npm version](https://badge.fury.io/js/can-ssr.svg)](http://badge.fury.io/js/can-ssr)

# can-ssr

Server-side rendering for CanJS.

## Server

To start a full server that hosts your application run:

> npm install can-ssr
> node_modules/.bin/can-server --port 3030

In your application folder.

Available options:

- __-p, --port__ - Set the port the server should run on
- __-d, --develop__ - Also starts a live-reload server
- __-p, --proxy__ <url> - Proxy a local path (default: `/api`) to the given URL (e.g. `http://api.myapp.com`)
- __-t, --proxy-to <path>__ - Set the proxy endpoint (default: `/api`)

## Usage

`can-ssr` can be used either as Express middleware or programatically.

### Express Middleware

Use the provided middleware to add server-side rendering to an existing Express server:

```js
var ssr = require('can-ssr/middleware');

app.use('/', ssr({
  config: __dirname + '/public/package.json!npm'
}));
```

The middleware includes a live-reload utility that can automatically refresh the cache for server-rendered responses. Use the `liveReload` option to enable this feature:

```js
app.use('/', ssr({
  config: __dirname + '/public/package.json!npm',
  liveReload: true
}));
```

__Note:__ Make sure the ssr middleware is the last middleware in the chain but before the error handler. Errors when rendering the application will be passed to your Express error handler. Error status codes (e.g. 404s or others set via `appState.status()`) will be rendered with the application.

### Use Programatically

```js
var render = require("can-ssr")({
  config: __dirname + "/public/package.json!npm",
  main: "index.stache!"
});

render("/orders").then(function(result){
  // Do something with `result.html`
  // Get the app state with `result.state`
  // e.g. for the statusCode in `result.state.attr('statusCode')`
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

```html
<html>
	<head>
		\{{asset "css"}}
	</head>
	<body>
		<can-import from="routes"/>

		...
	</body>
</html>
```

In this example, all CSS (either `<style>` or `<link>` elements depending on whether you are in development or production.

```html
\{{asset type}}
```

Specify the `type` to insert. Assets can be registered with `asset-register` (docs above). Types provided natively by JavaScriptMVC:

* **css**: Inserts a `<style>` or `<link>`
* **inline-cache**: If using the can.AppMap will insert data fetched as part of the page lifecycle.

## License

MIT
