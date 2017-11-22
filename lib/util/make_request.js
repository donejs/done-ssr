
module.exports = function(requestOrUrl) {
	if(typeof requestOrUrl === "string") {
		return {
			url: requestOrUrl,
			connection: {},
			headers: {host:"localhost"}
		};
	} else {
		return requestOrUrl;
	}
};
