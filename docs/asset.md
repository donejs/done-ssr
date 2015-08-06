@function can-ssr.helpers.asset asset
@parent can-ssr.helpers

A can.stache [helper](http://canjs.com/docs/can.stache.Helpers.html) that is used to add a type of asset to the page.

@signature `{{asset type}}` Add the **type** of asset to the page.

@param {String} type a type of asset such as **css**.
@return {DocumentFragment} A fragment appended to the page in the location of the helper.

@body

# Use

Plugins can implement the [asset.register] interface to provide types of assets that might need to be added to the page.

For example the [done-css](https://github.com/donejs/css) plugin registers itself as a handler for css assets. This allows you to do:

```html
<head>
	\{{asset "css"}}
</head>
```

which will generate:

```html
<head>
	<style>
		body {
		  ...
		}
	</style>
</head>
```

in development and in production:

```html
<head>
	<link rel="stylesheet" href="/dist/bundles/index.css">
</head>
```
