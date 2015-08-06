@constructor can-ssr.AppMap AppMap
@inherits can.Map
@parent can-ssr.client
@group can-ssr.AppMap.prototype 0 Prototype

A special [can.Map](http://canjs.com/docs/can.Map.html) that is used for server-side rendering.

@signature `AppMap.extend([staticProperties,] instanceProperties)`

Creates a new extended constructor function inheriting from AppMap.

@body

# Use

Using an AppMap is essential when doing server-side rendering with a CanJS application. AppMap is used to control the lifecycle of each request so that we know when rendering is "done" and the request can be completed.

You can think about it like this:

    (http request) ->
	  new AppMap() ->
	  (async behavior) ->
	  appMap.waitFor(promise) ->
	  (http response)

To use AppMap, make your top-level App State an instance of AppMap.

```js
var AppMap = require("can-ssr/app-map");

var AppState = AppMap.extend({
 // custom properties, functions here
});

module.exports = AppState;
```
