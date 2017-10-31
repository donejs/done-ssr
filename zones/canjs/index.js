
module.exports = function(response){
	return function(data){
		return {
			plugins: [
				require("./globals"),
				require("./route")(response),
				require("./cleanup")
			]
		};
	};
};
