var fs = require("fs");
var isPromise = require("is-promise");
var path = require("path");
var cloneUtils = require("ir-clone");

var clientScript = getClientScript();

module.exports = function(url){
	function appendToHead(document, element){
		if(!document.head) return;
		var fc = document.head.firstChild;
		if(fc) {
			document.head.insertBefore(element, fc);
		} else {
			document.head.appendChild(element);
		}
	}

	function firstOfKind(root, nodeName) {
		if (root == null) {
			return null;
		}

		var node = root.firstChild;
		while (node) {
			if (node.nodeName === nodeName) {
				return node;
			}
			node = node.nextSibling;
		}
		return null;
	}

	function makeIframe(document, data) {
		var clone = document.documentElement.cloneNode(true);
		// Disable all scripts, but leave them in the page so that ids
		// match up correctly.
		Array.from(clone.getElementsByTagName("script")).forEach(function(el){
			el.removeAttribute("src");
			if(el.firstChild) {
				el.firstChild.nodeValue = "";
			}
			el.setAttribute("data-noop", "");
		});

		var fakeDoc = { head: firstOfKind(clone, "HEAD") };

		// iframe placeholder
		appendToHead(fakeDoc, document.createComment("iframe placeholder"));

		// Preload
		if(data.isHTTP1) {
			var link = data.document.createElement("link");
			link.setAttribute("rel", "preload");
			link.setAttribute("as", "fetch");
			link.setAttribute("crossorigin", "anonymous");
			link.setAttribute("href", url);
			appendToHead(fakeDoc, link);
		}

		var script = document.createElement("script");
		script.setAttribute("type", "module");
		script.appendChild(document.createTextNode(clientScript));
		appendToHead(fakeDoc, script);

		// Append this to the document element
		clone.setAttribute("data-streamurl", url);

		var iframe = document.createElement("iframe");
		iframe.setAttribute("id", "donessr-iframe");
		iframe.setAttribute("data-keep", "");
		iframe.setAttribute("srcdoc", cloneUtils.serializeToString(clone));
		iframe.setAttribute("style", "border:0;position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;visibility:visible;");
		return iframe;
	}

	function injectIntoHead(document, element) {
		// If the documentElement is replaced (done-autorender),
		// move the script over to the new <head> element.
		var rc = document.replaceChild;
		document.replaceChild = function(newDocEl){
			var res = rc.apply(this, arguments);
			appendToHead(document, element);
			return res;
		};

		appendToHead(document, element);
	}

	return function(data){
		function injectStuff() {
			let doc = data.document;
			injectIntoHead(doc, makeIframe(doc, data));
			if(data.isHTTP1) {
				// Preload link placeholder
				injectIntoHead(doc, doc.createComment("autorender-keep preload placeholder"));
			}
			var closeScript = doc.createElement("script");
			closeScript.textContent = `window.closeSsrIframe=function(){var d=document;var f=d.getElementById("donessr-iframe");f.parentNode.removeChild(f);d.body.style.visibility = ''}`;
			appendToHead(doc, closeScript);
			doc.body.setAttribute("style", "visibility: hidden;");
			doc.documentElement.setAttribute("data-incrementally-rendered", "");
		}

		return {
			created: function() {
				data.injectIRFrame = injectStuff;
			},
			afterRun: function(){
				if(!isPromise(data.startMutations)) {
					injectStuff();
				}
			}
		};
	};
};

function getClientScript() {
	var dir = path.dirname(require.resolve("ir-reattach/ir-reattach.mjs"));
	var debugMode = typeof process.env.DONE_SSR_DEBUG !== "undefined";
	var clientPth = `${dir}/ir-reattach${debugMode ? "" : ".min"}.mjs`;
	return fs.readFileSync(clientPth, "utf8");
}
