var AppMap = require("can-ssr/app-map");
var can = require("can");
var QUnit = require("steal-qunit");
var loader = require("@loader");
var $ = require("jquery");

QUnit.module("can-ssr/app-map");

var keys = Object.keys || function(obj){
	var result = [];
	for (var prop in obj) {
		result.push(prop);
	}
};

QUnit.test("sorts correctly", function(){
	var map = new AppMap();
	map.pageData("foo", { "one": 1, "two": 2 }, {});
	map.pageData("foo", { "two": 2, "one": 1 }, {});

	QUnit.equal(keys(map.__pageData).length, 1, "There is one key");
});

QUnit.test("Correctly serializes json with scripts in it", function(){
	var cloneAsset;
	loader.set("asset-register", loader.newModule({
		"default": function(name, callback){
			cloneAsset = callback;
		}
	}));

	var map = new AppMap();
	map.pageData("foo", {foo:"bar"}, {
		"scripts": "just testing",
		readme: "# hello world\n ```<script type=\"test/stache\">something</script>```"
	});

	var script = cloneAsset();
	var icText = $(script).text();
	var frame = $("#qunit-test-area").append("<iframe id='myframe'/>").find("#myframe");
	frame.append("<script>" + icText + "</script>");

	QUnit.ok(window.INLINE_CACHE, "Inline cache exists");
	QUnit.ok(INLINE_CACHE.foo, "The set key exists");
});

QUnit.module("pageData");

QUnit.test("pageData with promises that fail set statusCode", function() {
	var dfd = can.Deferred();
	var map = new AppMap();
	map.pageData("promise", {}, dfd);

	dfd.reject({
		status: 500,
		statusText: "Server crashed"
	});

	QUnit.equal(map.attr("statusCode"), 500);
	QUnit.equal(map.attr("statusMessage"), "Server crashed");
});

QUnit.module("pageStatus");

QUnit.test("statusCode and statusMessage are not serialized", function(){
	var MyMap = AppMap.extend({});

	var params = {
		name: "Matthew",
		occupation: "JavaScripter"
	};
	var myMap = new MyMap(params);
	myMap.pageStatus(404, "That resource wasn't found");


	QUnit.deepEqual(myMap.serialize(), params, "Only the params were serialized");
});
