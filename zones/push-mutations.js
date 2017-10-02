var fs = require("fs");
var mutations = require("./mutations");
var path = require("path");

var clientScript = getClientScript();

module.exports = function(response, url){
	if(!url) {
		url = "/_donessr_instructions/" + Date.now();
	}

	function injectScript(document) {
		///<script data-streamurl="${url}">${clientScript}</script>
		var script = document.createElement("script");
		script.setAttribute("data-streamurl", url);
		script.appendChild(document.createTextNode(clientScript));

		var appendToHead = function(){
			var fc = document.head.firstChild;
			if(fc) {
				document.head.insertBefore(script, fc);
			} else {
				document.head.appendChild(script);
			}
		};

		// If the documentElement is replaced (done-autorender),
		// move the script over to the new <head> element.
		var rc = document.replaceChild;
		document.replaceChild = function(newDocEl){
			var res = rc.apply(this, arguments);
			appendToHead();
			return res;
		};

		appendToHead();
	}


	return function(data){
		var instrStream;

		return {
			plugins: [mutations(response)],

			created: function(){
				debugger;
				injectScript(data.document);

				instrStream = response.push(url, {
					status: 200,
					method: "GET",
					request: { accept: "*/*" },
					response: { "content-type": "text/plain" }
				});

				data.mutations.pipe(instrStream);
			},

			ended: function(){
				instrStream.end();
			}
		};
	};
};

function getClientScript() {
	var dir = path.dirname(require.resolve("done-ssr-incremental-rendering-client"));
	var basename = "done-ssr-incremental-rendering-client";
	var debugMode = typeof process.env.DONE_SSR_DEBUG !== "undefined";
	var clientPth = `${dir}/${basename}${debugMode ? "" : ".min"}.js`;
	return fs.readFileSync(clientPth, "utf8");
}
