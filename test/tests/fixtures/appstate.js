var DefineMap = require("can-define/map/map");

module.exports = DefineMap.extend({
	thingsPromise: {
		get: function(){
			return new Promise(function(resolve){
				var xhr = new XMLHttpRequest();
				xhr.open("GET", "http://www.example.org/stuff");
				xhr.addEventListener("load", function(){
					var json = xhr.responseText;
					var data = JSON.parse(json);
					resolve(data);
				});
				xhr.send();
			})
		}
	},
	things: {
		get: function(last, resolve){
			this.thingsPromise.then(resolve);
		}
	}
});
