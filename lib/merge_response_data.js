
/**
 * canWait returns an array of responses
 * These are all of the datas added via canWait.data({})
 *
 * We are using namespacing so that different libraries can all
 * add their own types of data. can-ssr knows of 2 types:
 *
 * **pageData**: This is data that will be part of the INLINE_CACHE
 *
 * **page**: These are the module names of pages dynamically imported like
 * app/orders/orders
 *
 * This module's responsibility is to copy over the responses onto the
 * AppViewModel instance so that they can be used by the stache helpers.
 */

module.exports = function(state, responses){
	responses = responses || [];

	// pageData
	var pageData = state.__pageData = state.__pageData || {};

	// renderingAssets
	var renderingAssets = state.__renderingAssets = state.__renderingAssets || [];

	responses.forEach(function(resp){
		if(resp.pageData) {
			Object.keys(resp.pageData).forEach(function(key){
				var child = resp.pageData[key];
				var parent = pageData[key];
				if(!parent) {
					parent = pageData[key] = {};
				}
				can.extend(parent, child);
			});
		}

		if(resp.page && renderingAssets.indexOf(resp.page) === -1) {
			renderingAssets.push(resp.page);
		}
	});
};
