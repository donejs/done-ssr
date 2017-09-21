var makeWindow = require("can-vdom/make-window/make-window");

module.exports = function(request){
	return function(data){
		// Create the document
		var window = makeWindow({});

		return {
			created: function(){
				data.document = window.document;
			},

			beforeTask: function(){
				Object.assign(global, window);
			},
			ended: function(){
				data.html = data.document.documentElement.outerHTML;
			}
		};
	};
};
