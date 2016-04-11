var debug = require("can-zone/debug");
var getBody = require("../get_body");

module.exports = function(doc, timeoutZone){

	return function(data){
		return {
			beforeTimeout: function(){
				var info = data.debugInfo || [];

				// The wrapper div that acts as the modal for the debug information
				var debugDiv = doc.createElement("div");
				debugDiv.setAttribute("id", "done-ssr-debug");
				debugDiv.setAttribute("style", debugStyles);

				var closer = doc.createElement("a");
				closer.setAttribute("style", closerStyles);
				closer.appendChild(doc.createTextNode("x"));
				closer.setAttribute("href", "javascript://");
				closer.setAttribute("onclick",
					"this.parentNode.parentNode.removeChild(this.parentNode)");
				debugDiv.appendChild(closer);

				info.forEach(function(d){
					var infoDiv = doc.createElement("div");

					var task = doc.createElement("h3");
					task.appendChild(doc.createTextNode(d.task));
					var stack = doc.createElement("div");

					d.stack.split("\n").forEach(function(part){
						stack.appendChild(doc.createElement("br"));
						stack.appendChild(doc.createTextNode(part));
					});

					infoDiv.appendChild(task);
					infoDiv.appendChild(stack);
					debugDiv.appendChild(infoDiv);
				});

				var body = getBody(doc);
				body.appendChild(debugDiv);
			},

			plugins: [debug(timeoutZone)]
		};
	};
};

var debugStyles = [
	"position: fixed",
	"top: 10px",
	"left: 10px",
	"right: 10px",
	"bottom: 10px",
	"border: 2px solid grey",
	"overflow: scroll",
	"padding: 5px",
	"background: white"
].join(";");

var closerStyles = [
	"position: absolute",
	"top: 0px",
	"right: 0px",
	"text-align: center",
	"background: grey",
	"font-size: 30px",
	"min-width: 35px",
	"min-height: 35px",
	"text-decoration: none",
	"color: inherit"
].join(";");
