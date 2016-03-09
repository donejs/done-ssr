<!--
@page done-ssr
@group done-ssr.node 0 Node
@group done-ssr.client 1 Client
@group done-ssr.helpers 2 Helpers
@group done-ssr.assets 3 Assets
-->

[![Build Status](https://travis-ci.org/donejs/done-ssr.svg?branch=master)](https://travis-ci.org/donejs/done-ssr)
[![npm version](https://badge.fury.io/js/done-ssr.svg)](http://badge.fury.io/js/done-ssr)

# done-ssr

Server-side rendering for [DoneJS](https://donejs.com/).

## Usage

**done-ssr** takes a system configuration object (the same object used by steal-tools to configure building) and returns a function that will render requests.

Pass your request into the render function and pipe the resulting stream into the response.

```js
var http = require("http");
var ssr = require("done-ssr");
var render = ssr();

var server = http.createServer(function(request, response){
	render(request).pipe(response);
});

server.listen(8080);
```

### Your app

done-ssr expect's your project's **main** to export a function that renders based on the request parameter. This will work with any module format supported by Steal.

```js
var ViewModel = can.Map.extend( { ... });

module.exports = function(request){
  var params = can.route.deparam(location.pathname);
  var viewModel = new ViewModel(params);

  // Do whatever is needed to render
};
```

The **request** parameter is the raw Node request object so you can do things like get request headers if needed.

Additionally the **location** object is set globally so you can use it like you would in a browser window.

More can be found in the [main module docs](https://github.com/donejs/done-ssr/blob/master/docs/main.md).

### Express Middleware and Development Server

As of *0.12* can-ssr was renamed to done-ssr. The Express middleware and can-serve functionality were moved to their own projects:

* [done-ssr-middleware](https://github.com/donejs/done-ssr-middleware)
* [done-serve](https://github.com/donejs/done-serve)

## License

MIT
