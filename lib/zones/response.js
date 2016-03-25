// The response zone handles adding things to the response

module.exports = function(stream){
	return function(data){

		var request;

		return {
			created: function(){
				request = data.request;
			},

			ended: function(){
				stream.emit("state", data.state);
				var statusCode = data.statusCode || 200;
				var responses = stream.dests;

				responses.forEach(function(response){
					response.statusCode = statusCode;
					setCookies(request, response);
				});
			}
		};
	};
};

function setCookies(request, response){
	var cookies = request.doneSsrCookies || {};
	var keys = Object.keys(cookies);
	var i, key, uh;

	for ( i = 0; i < keys.length; i++ ) {
		key = keys[ i ];
		uh = cookies[ key ];
		if ( !uh.isSSRReqCookie ) {
      //not a cookie that was on the initial request, basically any that are new from ssr, so forward them
			if(response.cookie) {
				response.cookie(key, uh.value, uh.options);
			}
		}
	}
}
