var assetsZone = require("../../zones/assets");
var canData = require("can-util/dom/data/data");

module.exports = function(doc, bundleHelpers, can){
	return function(data){
		var promises = [],
			usesCan = typeof can !== "undefined";

		// Keep track of can-import calls that happen during the initial render
		var oldCanImport;
		var canImport = function(el){
			var res = oldCanImport.apply(this, arguments);
			var promise = canData.get.call(el, "pageNormalizePromise");
			promises.push(promise);
			return res;
		};

		// Keep track of when initial styles have been inserted. These should
		// be part of the returned HTML. Any subsequent style insertions will
		// be sent out immediately after they happen.
		var initialStyles = false;
		var renderStylesIntoDocument = function(){
			initialStyles = true;
			data.applyPages();
		};

		return {
			plugins: [assetsZone(doc, bundleHelpers, can)],

			beforeTask: function(){
				if(!data.runCalled && usesCan) {
					oldCanImport = can.view.callbacks._tags["can-import"];
					can.view.callbacks._tags["can-import"] = canImport;
				}
			},
			afterTask: function(){
				if(!data.runCalled) {
					if(usesCan) {
						can.view.callbacks._tags["can-import"] = oldCanImport;
					}

					data.initialStylesLoaded = Promise.all(promises)
						.then(renderStylesIntoDocument);
				} else if(initialStyles) {
					renderStylesIntoDocument();
				}
			}
		};
	};
};
