The *done-ssr/zones/canjs* zone is used for integration with [canjs](https://canjs.com/) applications, mostly involving `can.route`.

```js
const Zone = require("can-zone");
const canjs = require("done-ssr/zones/canjs");

require("http").createServer(function(request, response){

	new Zone([
		canjs(response)
	])

}).listen(8080);
```

This zone provides the following features:

* [can-globals/location/location](https://canjs.com/doc/can-globals/location/location.html) will be set to the correct location throughout the zone's lifetime.
* [can-globals/document/document](https://canjs.com/doc/can-globals/document/document.html) will be set to the correct location throughout the zone's lifetime.
* can-route's [route.data](https://canjs.com/doc/can-route.data.html) property will be set throughout the zone's lifetime (this allows multiple requests to be processed at the same time).
* Additionally, if the *route.data* property contains a __statusCode__ value, that value will be set on the `response.statusCode`.

# Signature

## canjs(response)

In order to set the status code, this zone needs the http(s) *response* object.
