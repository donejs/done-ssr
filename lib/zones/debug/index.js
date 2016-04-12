var debug = require("can-zone/debug");
var getBody = require("../../get_body");
var fs = require("fs");

module.exports = function(doc, timeoutZone){
	var modal = fs.readFileSync(__dirname + "/modal.html", "utf8");
	var infoh = fs.readFileSync(__dirname + "/info.html", "utf8");

	return function(data){
		return {
			beforeTimeout: function(){
				var info = data.debugInfo || [];

				var div = doc.createElement("div");
				div.setAttribute("id", "done-ssr-debug");

				var infos = "";
				info.forEach(function(d){
					var stack = document.createElement("div");
					d.stack.split("\n").forEach(function(part){
						stack.appendChild(doc.createElement("br"));
						stack.appendChild(doc.createTextNode(part));
					});

					infos += infoh.replace("{{title}}", d.task)
						.replace("{{stack}}", stack.innerHTML);
				});

				div.innerHTML = modal.replace("{{body}}", infos);

				getBody(doc).appendChild(div);
			},

			plugins: [debug(timeoutZone)]
		};
	};
};
