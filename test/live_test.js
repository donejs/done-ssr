require("../lib/server/websocket");
var Steal = require("steal");
var http = require("http");
var assert = require("assert");

function req(){
	return new Promise(function(resolve, reject){
		var opts = { port: 8787 };
		var req = http.request(opts, function(res) {
			var body = "";
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				body += chunk;
			});
			res.on('end', function() {
				resolve(body);
			});
		});
		req.on("error", function(err){
			reject(err);
		});
		req.end();
	});
}

function wait(ms) {
	return new Promise(function(resolve){
		setTimeout(resolve, ms);
	});
}

describe("can-ssr live-reload", function(){
	before(function(done){
		var self = this;

		var steal = Steal.clone();
		var loader = global.System = steal.System;

		loader.config({
			config: __dirname + "/../package.json!npm",
			main: "live-reload-testing",
			liveReloadHost: "localhost"
		});

		steal.startup().then(function(args){
			self.liveReloadTest = args[0];
			done();
		}, done);
	});

	afterEach(function(done){
		this.liveReloadTest.reset().then(function(){
			done();
		});
	});

	it("initial html is correct", function(done){
		req().then(function(html){
			assert(/hello world/.test(html), "The initial html is correct.");
		}).then(done, done);
	});

	it("changes when the html changes", function(done){
		var content = "<html><head><title>live-reload test</title></head>" +
			"<body><can-import from='state' as='viewModel' />" +
			"<span>hello live</span>";
		var address = "index.stache";

		var liveReloadTest = this.liveReloadTest;

		liveReloadTest.put(address, content).then(function(){
			return wait(200);
		}).then(function(){
			return req();
		}).then(function(html){
			assert(/hello live/.test(html), "html updated after a live reload");
		}).then(done, done);
	});
});
