@function can-ssr.AppMap.prototype.pageData pageData
@parent can-ssr.AppMap.prototype

@description Notify can-ssr of page data that should be added to the [inline-cache].

@signature `appMap.pageData(key, set, inst)`

Appends the data to the [can-ssr.AppMap]'s application data cache, to be used for appending to the page's [inline-cache].

@param {String} key A key to use to distinguish this type of page data.
@param {Object} set An object of key/value pairs that can be serialized to a JSON string. Used as a representation for the subtype of data being cached.
@param {Promise|Object} inst An object which contains the instance data to be cached. If the instance is a Promise, [can-ssr.AppMap.prototype.waitFor] will be called so that the page waits for the promise to resolve.

@return {Object} The instance passed into pageData.

@body

# Use

pageData is used to pass data that is collected as part of the rendering cycle used to populate the [inline-cache]. For example:

```js
var TodosApp = can.Map.extend({
	define: {
		todos: {
			get: function(){
				var params = {
					status: "complete"
				};

				var todosPromise = Todos.getList(params);

				var appState = this.attr("%root");
				return appState.pageData("todos", params, todosPromise);
			}
		}
	}
});

can.Component.extend({
	tag: "todos-app",
	viewModel: TodosApp
});
```

In this example the Todo model is fetching a list of Todos from the server that have a **status** of "complete". Passing this information into pageData will cause the [inline-cache] to be populated like so:

```html
<script>
	INLINE_CACHE = {
		"todos": {
			"{'status':'complete'}": [
				{ description: "Clean room", status: "complete" },
				{ description: "Mow lawn", status: "complete" }
			]
		}
	};
</script>
```

This information can be used by your application to perform the page's initial render. If using [can-connect](http://connect.canjs.com/) it will use the inline cache to prevent extra requests from being made.
