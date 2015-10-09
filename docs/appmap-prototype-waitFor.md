@function can-ssr.AppMap.prototype.waitFor waitFor
@parent can-ssr.AppMap.prototype

@description Wait for a Promise to resolve.

@signature `appMap.waitFor(promise)`

Adds `promise` as a pending Promise in the rendering lifecycle.

@param {Promise} promise The Promise to wait for resolution/rejection.
@return {Promise} the promise passed into waitFor.

@body

# Use

Use `waitFor` to notify the can-ssr that asynchronous behavior needs to complete before the page is fully rendered.

An example of using waitFor would be when doing an ajax request in a ViewModel. Your viewModel might look like:

```js
var TodosApp = can.Map.extend({
	define: {
		todos: {
			get: function(){
				var todosPromise = Todos.findAll();

				return this.attr("%root").waitFor(todosPromise);
			}
		}
	}
});

can.Component.extend({
	tag: "todos-app",
	viewModel: TodosApp
});
```

`%root` is a special property added to every can.Component View Model, it is the parent-most viewModel for the template. In this example it is a [can-ssr.AppMap].
