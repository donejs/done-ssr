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

		var fc = document.head.firstChild;
		if(fc) {
			document.head.insertBefore(script, fc);
		} else {
			document.head.appendChild(script);
		}
	}


	return function(data){
		var instrStream;

		return {
			plugins: [mutations(response)],

			created: function(){
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
