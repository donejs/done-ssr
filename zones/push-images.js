
module.exports = function(stream, root){
	root = root || process.cwd();

	var fs = require("fs");
	var mime = require("mime-types");
	var url = require("url");

	return function(data){
		var images = new Set();
		var oldCreateElement;
		var document;

		function pushImage(img) {
			var mimeType = mime.lookup(img.src);
			if(mimeType) {
				stream.pushStream({":path": img.src}, (err, pushStream) => {
					if(err) throw err;

					let path = url.parse(img.src).pathname;
					let sendStream = fs.createReadStream(root + path);

					pushStream.respond({
						":status": 200,
						":method": "GET",
						"content-type": mimeType
					});

					sendStream.pipe(pushStream);
				});
			}
		}

		function pushAddedImages() {
			for(let img of images) {
				if(document.documentElement.contains(img)) {
					images.delete(img);
					pushImage(img);
				}
			}
		}

		function documentCreateElement(tagName) {
			var element = oldCreateElement.apply(this, arguments);
			if(tagName.toLowerCase() === "img") {
				images.add(element);
			}
			return element;
		}

		return {
			created: function(){
				document = data.document;
			},
			beforeTask: function(){
				oldCreateElement = document.createElement;
				document.createElement = documentCreateElement;
			},
			afterTask: function(){
				document.createElement = oldCreateElement;
				pushAddedImages();
			}
		};
	};
};
