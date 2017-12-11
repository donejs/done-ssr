var DefineMap = require("can-define/map/map");

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
		value: function(){
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
	someError: function(){
		throw new Error("This is an error.");
	}
});
