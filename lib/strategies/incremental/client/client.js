var apply = require("dom-patch/apply");

var streamurl = document.currentScript.dataset.streamurl;
function render(instruction){
	apply(document, instruction);
}

fetch(streamurl, {
	credentials: "same-origin"
}).then(function(response){
	var reader = response.body.getReader();
	var decoder = new TextDecoder();

	function read() {
		return reader.read().then(function(result){
			var resultValue = result.value || new Uint8Array();
			var chunk = decoder.decode(resultValue);

			chunk.split("\n")
			.filter(function(str) { return str.length; })
			.map(function(itemStr){
				return JSON.parse(itemStr);
			})
			.forEach(function(instruction){
				render(instruction);
			});

			if(!result.done) {
				return read();
			}
		});
	}

	return read().catch(function(err){
		console.error(err);
	});
});
