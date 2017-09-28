
// This is weird and should be moved some where else. Into canjs I think.
// TODO move this
module.exports = function(response){
	return function(data){
		return {
			ended: function(){
				var statusCode = data.statusCode;
				if(statusCode) {
					response.statusCode = statusCode;
				}
			}
		}
	};
};
