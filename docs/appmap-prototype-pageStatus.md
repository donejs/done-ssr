@function can-ssr.AppMap.prototype.pageStatus pageStatus
@parent can-ssr.AppMap.prototype

@description Set the HTTP status code and message.

@signature `appMap.pageStatus(code, message)`

Set the HTTP status code and message

@param {Integer} code The [HTTP status code](http://httpstatus.es/)
@param [String] message A status message

@return {can-ssr.AppMa} The AppMap instance

@body

# Use

`pageStatus` can be used to set the HTTP status returned by server side rendering. It will internally set the `statusCode` and `statusMessage` properties on the `appMap`. The default `statusCode` is 200. Deferreds added to [can-ssr.AppMap.prototype.pageData pageData] will automatically set an error status code if any of them fails. If no matching `can.route` has been found, a 404 error will be set.

To show an error page check the `statusCode` in the main template like this:

```
{{^eq statusCode 200}}
	An error occurred: {{statusMessage}}
{{/eq}}
```

To show different error pages a switch statement can also be used:

```
{{#switch statusCode}}
	{{#case 404}}
		This are not the Droids you are looking for.
	{{/case}}
	{{#case 500}}
		Sorry, our API crashed.
	{{/case}}
	{{#default}}
		{{! spin up your application here}}
	{{/default}}
{{/switch}}
```
