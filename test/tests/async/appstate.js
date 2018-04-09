var DefineMap = require("can-define/map/map");
require("./helpers");

module.exports = DefineMap.extend({
	page: {
		set: function(val){
			if(val === "home") {
				var state = this;
				setTimeout(function(){
					state.message = "hello async!";
				}, 300);
			}

			return val;
		}
	},
	language: {
		default: function(){
			return navigator.language;
		}
	},
	message: "string",
	statusCode: {
		get: function(last, resolve){
			if(!resolve) return 200;
			var page = this.page;
			setTimeout(function(){
				var status = page === "fake" ? 404 : 200;
				resolve(status);
			}, 50);
		}
	},
	showError: "boolean",
	someError: function(){
		throw new Error("This is an error.");
	},
	removeHead: "boolean",
	removeTheDocHead: function() {
		document.documentElement.removeChild(document.head);
	}
});
