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

[![Greenkeeper badge](https://badges.greenkeeper.io/donejs/done-ssr.svg)](https://greenkeeper.io/)

Server-side rendering for [DoneJS](https://donejs.com/).

- [done-ssr](#done-ssr)
  - [Install](#install)
  - [Usage](#usage)
    - [Your app](#your-app)
    - [Express Middleware and Development Server](#express-middleware-and-development-server)
  - [API](#api)
    - [ssr(steal, options) -> render](#ssrsteal-options---render)
      - [steal](#steal)
      - [options](#options)
        - [timeout : 5000](#timeout--5000)
          - [Debugging Timeouts](#debugging-timeouts)
        - [debug : false](#debug--false)
        - [exitOnTimeout : false](#exitontimeout--false)
        - [auth: {cookie, domains}](#auth-cookie-domains)
        - [strategy: 'incremental'](#strategy-incremental)
        - [zones](#zones)
        - [domZone](#domzone)
        - [xhrCache: true](#xhrcache-true)
    - [render(request)](#renderrequest)
    - [DONE_SSR_DEBUG](#done_ssr_debug)
  - [License](#license)

## Install

```shell
npm install done-ssr --save
```

## Usage

**done-ssr** takes a *steal* configuration object (the same object used by steal-tools to configure building) and returns a function that will render requests.

Pass your request into the render function and pipe the resulting stream into the response.

```js
const http = require("http");
const ssr = require("done-ssr");
const render = ssr();

const server = http.createServer(function(request, response){
	render(request).pipe(response);
});

server.listen(8080);
```

### Your app

__done-ssr__ expect's your project's **main** to export a function that renders based on the request parameter. This will work with any module format supported by Steal.

```js
const ViewModel = DefineMap.extend( { ... });

module.exports = function(request){
  var params = route.deparam(location.pathname);
  var viewModel = new ViewModel(params);

  // Do whatever is needed to render
};
```

The **request** parameter is the raw Node request object so you can do things like get request headers if needed.

Additionally the **location** object is set globally so you can use it like you would in a browser window.

More can be found in the [main module docs](https://github.com/donejs/done-ssr/blob/master/docs/main.md).

### Express Middleware and Development Server

__done-ssr__ provides the low-level server rendering capabilities in DoneJS. It takes a request and a response and renders your application into the response. If you are writing a Node server yourself, done-ssr is likely for you.

If you are using a framework, like [Express](https://expressjs.com/) then you'll want to use __[done-ssr-middleware](https://github.com/donejs/done-ssr-middleware)__.

If you're looking for a development server that provides you most of what you need, and can run from the cli, then use __[done-serve](https://github.com/donejs/done-serve)__.

## API

### ssr(steal, options) -> render

The `ssr` function contains two arguments, one for the **steal** object and one is an **options** object:

#### steal

Configuration options that are a [StealConfig](https://stealjs.com/docs/steal-tools.StealConfig.html). This is the same object that is passed into steal-tools to configure the loader for building.

#### options

##### timeout : 5000

Specify a timeout in milliseconds for how long should be waited before returning whatever HTML has already been rendered. Defaults to **5000**.

###### Debugging Timeouts

A timeout might occur for a variety of reasons such as:

* __Running in development__: In development the server has to load all modules the first time a request is made. In this case the first render could timeout. You can specify a longer timeout to remedy this.
* __Unresolved promise__: If you have a promise that never resolves it could cause a timeout. Be sure to always resolve your promises and catch rejections.
* __Undetectable recursion__: can-zone tracks all types of asynchronous tasks. Some times it can't detect that a program will never complete. One example is `setTimeout` call that is called recursively. Use [Zone.ignore](https://github.com/canjs/can-zone/tree/master/docs) to ignore those type of code.

If all else fails, use the [debug](#debug--false) option to get more information on why the timeout occurs.

##### debug : false

Specify to turn on debug mode when used in conjunction with timeout. If rendering times out debugging information will be attached to a modal window in the document. For this reason you only want to use the debug option during development.

![debug output](https://cloud.githubusercontent.com/assets/361671/14474862/08b5f01e-00cd-11e6-8d70-b3f3ba835493.png)

##### exitOnTimeout : false

This option is for the rare instance where the above debugging tips and info do not resolve a timeout, or the timeout is sporadic and difficult to find. With this option set to `true` a timeout error will still display the warning, but will exit the Node process cleanly, allowing redundant processes to take over on future calls.

##### auth: {cookie, domains}

An object for enabling JavaScript Web Tokens (JWT) support for XHR requests made by the SSR server. Must contain both of the following values:

- `cookie`: A string representing the cookie name where the SSR server can look to find a JWT token.  That token gets applied as the "Bearer" token in the authorization header of every outgoing XHR.

> For example, if the SSR server receives a cookie like `feathers-jwt=<token>;`, and the `authCookie` option is set to `"feathers-jwt"`, outgoing requests from the SSR server will have an `authorization` header of `Bearer <token>`

- `domains`: An array of domain names to which the JWT token will be sent.  Any domains not in this list will not receive the JWT token.

##### strategy: 'incremental'

Specify the rendering strategy. Starting in done-ssr 3 the default is __incremental__. If you are using SSR primarily for SEO (and not performance) you will want to set this to __seo__.

```js
const render = ssr(steal, {
  strategy: "seo"
});
```

##### zones

Specify additional [zones](https://github.com/canjs/can-zone) to be added. This is an advanced option most will not need. You might add zones to do some sort of special processing to the DOM. You can essentially do whatever you want to `data.document` within a Zone like so:

```js
const render = ssr({}, {
  zones: [
    function(data) {
      return {
        ended: function() {
          // Remove all scripts. Why, idk.
          let scripts = Array.from(data.document.getElementsByTagName("script"));
          for(let script of scripts) {
            script.parentNode.removeChild(script);
          }
        }
      }
    }
  ]
});
```

##### domZone

Specify the zone that provides the DOM. This zone must create a `window`, a `document`, and other associated globals and set them on Node's `global`.

This option is a __function__ that takes the *request* and *response*. By default done-ssr uses [can-simple-dom](https://github.com/canjs/can-simple-dom).

For example, this is how you can use [can-zone-jsdom](https://github.com/canjs/can-zone-jsdom) to get a much more complete DOM implementation.

```js
const ssr = require('done-ssr');
const dom = require('can-zone-jsdom');

const render = ssr({}, {
  domZone: request => dom(request, {
    root: __dirname + '/build',
    html: 'index.html'
  })
});

// ... use render like normal.
```

##### xhrCache: true

Specifies if the XHR cache should be inlined into the page. The XHR cache is used to prevent duplicate requests from occuring in the client when hydrating from server-rendering HTML. In some cases you might not use XHR in the client and therefore want to prevent the script from being included.

```js
const ssr = require('done-ssr');

const render = ssr({}, {
	xhrCache: false
});
```

### render(request)

The **render** function is returned from the call to [ssr](#ssrsteal-options---render) and is what used to render requests. It returns a [readable stream](https://nodejs.org/api/stream.html#stream_class_stream_readable) that can be piped into other streams, using the response stream.

```js
render(request).pipe(response);
```

You can use request/response streams from servers created with `require("http")`, or [Express](http://expressjs.com/) and probably most other Node servers.

### DONE_SSR_DEBUG

The `DONE_SSR_DEBUG` environment variable can be used if you need to debug what is happening during incremental rendering reattachment. This provides unminified reattachment code. Set it to any value to enable the debugging. `export DONE_SSR_DEBUG=1`.

## License

MIT
