@function inline-cache
@parent can-ssr.assets

A representation of page data that was used to render the page.

@signature `{{asset "inline-cache"}}`

Creates a global object added to the page that contains all page data used to render the route.

@body

# Use

You can add the inline cache to your page using the [can-ssr.helpers.asset asset helper]:

```html
<body>
 ...

 \{{asset "inline-cache"}}

</body>
```

Will generate:

```html
<body>
 ...

 <script>
	INLINE_CACHE = {"key": {...}}
 </script>

</body>

```
