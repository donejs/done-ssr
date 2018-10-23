var assert = require("assert");
var cloneUtils = require("ir-clone");
var isPromise = require("is-promise");
var Readable = require("stream").Readable;
var moUtils = require("done-mutation-observer");
var MutationEncoder = require("done-mutation/encoder");
var NodeIndex = require("done-mutation/index");

module.exports = function(){
	return function(data){
		var observer, encoder, nodeIndex;

		var mutationStream = new Readable({
			// Required, but we push manually
			read() {}
		});

		function onMutations(records) {
			var bytes = encoder.encode(records);
			mutationStream.push(bytes);
		}

		function startListeningToMutations() {
			Object.defineProperty(data, "html", {
				value: cloneUtils.serializeToString(data.document),
				enumerable: true,
				configurable: true,
				writable: false
			});

			observer.observe(data.document, {
				subtree: true,
				childList: true,
				characterData: true,
				attributes: true
			});
		}

		return {
			created() {
				assert(data.document, "The mutations zone requires a document.");
				assert(data.window, "The mutations zone requires a window.");

				var MutationObserver = moUtils.addMutationObserver(data.window);
				observer = new MutationObserver(onMutations);
				nodeIndex = new NodeIndex(data.document);
				encoder = new MutationEncoder(nodeIndex);
				nodeIndex.startObserving();
				data.mutations = mutationStream;
			},
			afterRun: function(){
				// If another plugin has a Promise for delaying mutations,
				// wait for that to resolve.
				if(isPromise(data.startMutations)) {
					data.startMutations.then(startListeningToMutations);
				} else {
					startListeningToMutations();
					data.html = cloneUtils.serializeToString(data.document);
				}
			},
			afterStealMain: function(){
				data.html = cloneUtils.serializeToString(data.document);
			},
			ended: function(){
				observer.disconnect();
				nodeIndex.stopObserving();
				mutationStream.push(null);
			}
		};
	};
};

function truthyObject(acc, key){
	acc[key] = true;
	return acc;
}
