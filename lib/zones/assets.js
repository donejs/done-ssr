var canImportZone = require("./can_import");

module.exports = function(doc, bundleHelpers, can){
	return function(data){
		var inserted = new Set();
		return {
			plugins: [canImportZone(can)],

			beforeRun: function(){
				data.applyPages = function(){
					var pages = data.pages || [];
					applyPages(doc, bundleHelpers, pages, inserted);
				};
			},

			ended: function(){
				data.applyPages();
			}
		};
	};
};

function applyPages(document, bundleHelpers, pages, inserted){
	var findBundle = bundleHelpers.findBundle;
	var bundles = bundleHelpers.bundles;

	var head = document.head;

	pages.forEach(function(moduleName){
		var bundle = findBundle(moduleName) || bundles[moduleName];

		if(bundle) {
			Object.keys(bundle).forEach(function(childName){
				var asset = bundle[childName];
				if(asset && !inserted.has(asset.id)) {

					inserted.add(asset.id);
					var node = asset.value();
					node.setAttribute("asset-id", asset.id);
					head.insertBefore(node, head.lastChild);
				}
			});
		}
	});
}
