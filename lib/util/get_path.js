var URL = require("url").URL;

module.exports = function(headersOrRequestOrUrl) {
	if(typeof headersOrRequestOrUrl === "string") {
		return new URL(headersOrRequestOrUrl).pathname;
	} else if(headersOrRequestOrUrl[":path"]) {
		return headersOrRequestOrUrl[":path"];
	} else {
		return headersOrRequestOrUrl.url;
	}
};
