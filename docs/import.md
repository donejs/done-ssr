# can-ssr/import

Using can-ssr/import provides a convenient way to progressively import modules that works both in the client and the server.

**can-ssr/import** provides the same API as System.import, so your use will be identical.

```js
var importPage = require("can-ssr/import");

importPage("pmo/orders/").then(function(orders){
 // use orders
});
```
