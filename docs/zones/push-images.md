*done-ssr/zones/push-images* is a zone that is used to initiate PUSH promises on images created using `new Image()` or `document.createElement('img')` APIs. Pushing these images will result in faster load times for your page.

```js
const Zone = require("can-zone");
const dom = require("done-ssr/zones/can-simple-dom");
const pushImages = require("done-ssr/zones/push-images");
const app = require("./app");

require("donejs-spdy", {
	cert: ...,
	key: ...
}, function(request, response){

	new Zone([
		dom(request),
		pushImages(response)
	])
	.run(app);

}).listen(8081);
```

where *app.js* looks like:

```js
module.exports = function(){
	let img = document.createElement("img");
	img.src = "/images/cat.png";
	document.body.appendChild(img);
};
```

Will result in `/images/cat.png` being PUSHed.

# Signature

## pushImages(response)

*done-ssr/zones/push-images* expects an http(s) response object, which it uses to initiate the PUSH promise.
