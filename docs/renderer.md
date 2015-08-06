@function can-ssr.renderer renderer
@parent can-ssr.module

A renderer function used to generate html from a route.

@signature `render(route)`

```js
render("/orders").then(function(html){
	res.send(html);
});
```

@param {String} route

A route for which the application should render. For example **"/orders"**.

@return {Promise<String>} A promise that, when resolved, will contain the string representation of the page after rendering.

@signature `render(state)`

@param {Object} state Instance data that will be passed into the [AppMap] constructor to use as the template's viewModel.

@return {Promise<String>} A promise that, when resolved, will contain the string representation of the page after rendering.
