var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer();

module.exports = function (target) {
	return function (req, res) {
		proxy.web(req, res, {
			target: target,
			changeOrigin: true
		});
	};
};
