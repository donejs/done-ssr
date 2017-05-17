
module.exports = function(requestOrUrl) {
	if(typeof requestOrUrl === "string") {
		return {
			url: requestOrUrl
		};
	} else {
		return requestOrUrl;
	}
};
