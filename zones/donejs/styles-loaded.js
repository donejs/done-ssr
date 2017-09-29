var canData = require("can-util/dom/data/data");

module.exports = function(){
	return function(data){
		var can, loadedResolve, loadedReject;
		var promises = [], runCalled = false,
		loaded = new Promise(function(resolve, reject){
			loadedResolve = resolve;
			loadedReject = reject;
		});

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
			created: function(){
				data.initialStylesLoaded = data.startMutations = loaded;
			},
			afterStealDone: function(){
				can = data.modules.can;
			},
			afterStealMain: function(){
				runCalled = true;

				Promise.all(promises)
					.then(renderStylesIntoDocument)
					.then(loadedResolve, loadedReject);
			},
			beforeTask: function(){
				if(can) {
					oldCanImport = can.view.callbacks._tags["can-import"];
					if(oldCanImport) {
						can.view.callbacks._tags["can-import"] = canImport;
					}
				}
			},
			afterTask: function(){
				if(can && oldCanImport) {
					can.view.callbacks._tags["can-import"] = oldCanImport;
					renderStylesIntoDocument();
				}
			}
		};
	};
};
