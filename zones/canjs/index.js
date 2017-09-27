
module.exports = function(){
	return function(data){
		return {
			plugins: [
				require("./globals"),
				require("./route")
			]
		};
	};
};
