var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer();

module.exports = function (app, options) {
	var apiPath = options.proxyTo || '/api';
	var oldListen = app.listen;
	var middleware = function(target) {
		return function(req, res) {
			proxy.web(req, res, {
				target: target,
				changeOrigin: true,
				secure: options.proxyCertCheck
			});
		};
	};

	if(apiPath.charAt(0) !== '/') {
		apiPath = '/' + apiPath;
	}

	app.use(apiPath, middleware(options.proxy));
	app.use('/socket.io/', middleware(options.proxy + '/socket.io/'));


	app.listen =  function() {
		var server = oldListen.apply(this, arguments);

		server.on('upgrade', function(req,res){
		  proxy.ws(req, res, {
		    target: options.proxy
		  });
		});

		return server;
	};
};
