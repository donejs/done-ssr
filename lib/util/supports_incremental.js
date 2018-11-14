var makeHeaders = require("./make_headers");
var useragent = require("useragent");

module.exports = function(requestOrHeaders) {
	var headers = makeHeaders(requestOrHeaders);
	var uaString = headers["user-agent"] || "";
	var agent = useragent.is(uaString);

	return agent.chrome || agent.firefox || agent.safari;
};
