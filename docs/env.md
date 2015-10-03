@typedef {{}} can-ssr.helpers.env env
@parent can-ssr.helpers

An object containing all environmental variables exposed in Node.js through `process.env`.

@body

# Use

Use `env` to control parts of the page that will different depending on the environment the application is running in.  For example, you will probably want to run your application in production mode when in production, you can use `env` to control that:

```html
<body>

  \{{#switch env.NODE_ENV}}
    \{{#case "production"}}
      <script src="/node_modules/steal/steal.production.js"
	    main="app/app"></script>
    \{{/case}}

    \{{#default}}
      <script src="node_modules/steal/steal.js"></script>
    \{{/default}}
  \{{/switch}

</body>
```
