
module.exports = function(requestOrUrl) {
	if(typeof requestOrUrl === "string") {
		return {
			method: "GET",
			protocol: "http",
			url: requestOrUrl,
			connection: {},
			headers: {host:"localhost"},
			get: function(name) {
				return this.headers[name.toLowerCase()];
			}
		};
	} else {
		return requestOrUrl;
	}
};
