
module.exports = function(state, responses){
	responses = responses || [];
	var pageData = state.__pageData = state.__pageData || {};
	responses.forEach(function(resp){
		if(resp.pageData) {
			can.extend(pageData, resp.pageData);
		}
	});
};
