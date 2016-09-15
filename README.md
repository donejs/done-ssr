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

- [Install](#install)
- [Usage](#usage)
- [API](#api)
  - <code>[ssr(system, options)](#ssrsystem-options---render)</code>
    - <code>[system](#system)</code>
	- <code>[options](#options)</code>
	  - <code>[timeout](#timeout--5000)</code>
	  - <code>[debug](#debug--false)</code>
	  - <code>[html5shiv](#html5shiv--false)</code>
  - <code>[render(request)](#renderrequest)</code>

## Install

```shell
npm install done-ssr --save
```

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

## API

### ssr(system, options) -> render

The `ssr` function contains two arguments, one for the **system** object and one is an **options** object:

#### system

Configuration options that are a [SystemConfig](http://stealjs.com/docs/steal-tools.SystemConfig.html). This is the same object that is passed into steal-tools to configure the loader for building.

#### options

##### timeout : 5000

Specify a timeout in milliseconds for how long should be waited before returning whatever HTML has already been rendered. Defaults to **5000**

##### auth: {cookie, domains}

An object for enabling JavaScript Web Tokens (JWT) support for XHR requests made by the SSR server. Must contain both of the following values:

- `cookie`: A string representing the cookie name where the SSR server can look to find a JWT token.  That token gets applied as the "Bearer" token in the authorization header of every outgoing XHR.

> For example, if the SSR server receives a cookie like `feathers-jwt=<token>;`, and the `authCookie` option is set to `"feathers-jwt"`, outgoing requests from the SSR server will have an `authorization` header of `Bearer <token>`

- `domains`: An array of domain names to which the JWT token will be sent.  Any domains not in this list will not receive the JWT token.

##### debug : false

Specify to turn on debug mode when used in conjunction with timeout. If rendering times out debugging information will be attached to a modal window in the document. For this reason you only want to use the debug option during development.

![debug output](https://cloud.githubusercontent.com/assets/361671/14474862/08b5f01e-00cd-11e6-8d70-b3f3ba835493.png)

##### html5shiv : false

Specifies where html5shiv should be configured and attached to the document's head. This will automatically register all of the custom can.Component elements for you when using IE8.

### render(request)

The **render** function is returned from the call to [ssr](#ssrsystem-options---render) and is what used to render requests. It returns a [readable stream](https://nodejs.org/api/stream.html#stream_class_stream_readable) that can be piped into other streams, using the response stream.

```js
render(request).pipe(response);
```

You can use request/response streams from servers created with `require("http")`, or [Express](http://expressjs.com/) and probably most other Node servers.

## License

MIT
