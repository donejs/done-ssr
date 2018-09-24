var http = require("http");

exports.createServer = function(port, cb){
	var server = http.createServer(cb).listen(port);

	return new Promise((resolve, reject) => {
		server.on("listening", function(){
			resolve(server);
		});
	});
};

exports.serveAPI = function(port = 8070) {
	var handler  = function(req, res){
		var data;
		switch(req.url) {
			case "/bar":
				data = [ { "a": "a" }, { "b": "b" } ];
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify(data));
				break;
			default:
				throw new Error("No route for " + req.url);
		}
	};

	return exports.createServer(port, handler);
};
