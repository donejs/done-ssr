function makeExpectation(type) {
	var original;
	var expectedResults = [];

	function stubbed() {
		var message = Array.from(arguments).map(function(token) {
			// Case for error objects. If you send an error to the console,
			//  its "toString" gives you "Error: " plus the message, which
			//  is undesirable for trying to check its content against a known
			//  string
			if(typeof(token) !== "string" && token.message) {
				return token.message;
			} else {
				return token;
			}
		}).join(" ");

		expectedResults.forEach(function(expected) {
			var matched = typeof expected.source === "string" ?
				message === expected.source :
				expected.source.test(message);

			if(matched) {
				expected.count++;
			}
			if(typeof expected.fn === "function") {
				expected.fn.call(null, message, matched);
			}
		});
	}

	return function(expected, fn) {
		var matchData = {
			source: expected,
			fn: fn,
			count: 0
		};
		expectedResults.push(matchData);

		if(!original) {
			original = console[type];
			console[type] = stubbed;
		}

		// Simple teardown
		return function() {
			expectedResults.splice(expectedResults.indexOf(matchData), 1);
			if(original && expectedResults.length < 1) {
				// restore when all teardown functions have been called.
				console[type] = original;
				original = null;
			}
			return matchData.count;
		};
	};
}

module.exports = {
	willWarn: makeExpectation("warn"),
	willError: makeExpectation("error")
};
