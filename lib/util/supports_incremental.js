var makeHeaders = require("./make_headers");
var useragent = require("useragent");

module.exports = function(requestOrHeaders) {
	var headers = makeHeaders(requestOrHeaders);
	var uaString = headers["user-agent"] || "";
	var agent = useragent.lookup(uaString);
	var browser = useragent.is(uaString);

	return agent.family !== "Edge" && (browser.chrome || browser.safari);
};
