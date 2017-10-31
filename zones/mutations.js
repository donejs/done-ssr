var assert = require("assert");
var domPatch = require("dom-patch");
var isPromise = require("is-promise");
var Readable = require("stream").Readable;

domPatch.collapseTextNodes = true;
var patchTypes = ["attribute", "replace", "insert",
	"remove", "text", "prop", "style"].reduce(truthyObject, {});

module.exports = function(){
	return function(data){
		var mutationStream = new Readable({
			read() {
				// This happens automatically on patch changes
			}
		});

		function onChanges(changes){
			var instructions = changes.filter(function(change){
				// Is this one of the changes that we care about.
				return patchTypes[change.type];
			});

			if(instructions.length) {
				var msg = JSON.stringify(instructions) + "\n";
				mutationStream.push(msg);
			}
		}

		function startListeningToMutations() {
			domPatch(data.document, onChanges);
		}

		return {
			created() {
				assert(data.document, "The mutations zone requires a document.");
				data.mutations = mutationStream;
			},
			afterRun: function(){
				// If another plugin has a Promise for delaying mutations,
				// wait for that to resolve.
				if(isPromise(data.startMutations)) {
					data.startMutations.then(startListeningToMutations);
				} else {
					startListeningToMutations();
				}

				data.html = data.document.documentElement.outerHTML;
			},
			afterStealMain: function(){
				data.html = data.document.documentElement.outerHTML;
			},
			ended: function(){
				domPatch.flush();
				domPatch.unbind(data.document, onChanges);
			}
		};
	};
};

function truthyObject(acc, key){
	acc[key] = true;
	return acc;
}
