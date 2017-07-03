var assetsZone = require("../../zones/assets");
var canData = require("can-util/dom/data/data");

module.exports = function(doc, bundleHelpers, can){
	return function(data){
		var promises = [], initialRun = false;

		// Keep track of can-import calls that happen during the initial render
		var oldCanImport;
		var canImport = function(el){
			var res = oldCanImport.apply(this, arguments);
			var promise = canData.get.call(el, "pageNormalizePromise");
			promises.push(promise);
			return res;
		};

		var renderStylesIntoDocument = function(){
			data.applyPages();
		};

		return {
			plugins: [assetsZone(doc, bundleHelpers, can)],

			beforeTask: function(){
				if(!initialRun) {
					oldCanImport = can.view.callbacks._tags["can-import"];
					can.view.callbacks._tags["can-import"] = canImport;
				}
			},
			afterTask: function(){
				if(!initialRun) {
					initialRun = true;
					can.view.callbacks._tags["can-import"] = oldCanImport;
					data.initialStylesLoaded = Promise.all(promises)
						.then(renderStylesIntoDocument);
				}
			}
		};
	};
};
