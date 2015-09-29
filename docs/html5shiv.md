@function html5shiv
@parent can-ssr.assets

Conditionally load [html5shiv](https://github.com/afarkas/html5shiv) and register custom
elements for use with legacy versions of Internet Explorer.

@signature `{{asset "html5shiv"}}`

Creates script tags adding html5shiv and registering custom elements.

@body

# Use

html5shiv needs to be added to the page before any custom elements appear. It is best
to place it in the `<head>`, probably after your css. Your page might look like:

```handlebars
<html>
<head>
	<title>My App</title>

	{{asset "css"}}
	{{asset "html5shiv"}]
</head>
<body>
	...
</body>
</html>
```

This will produce something like:

```html
<html>
<head>
	<title>My App</title>

	<link href="foo.css">
	<script src="path/to/html5shiv.js"></script>
	<script>
		html5.elements = "order-history can-import";
		html5.shivDocument();
	</script>
</head>
<body>
	...
</body>
</html>
```
