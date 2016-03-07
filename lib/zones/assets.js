var canImportZone = require("./can_import");

module.exports = function(doc, bundleHelpers){
	return function(data){
		return {
			plugins: [canImportZone],

			ended: function(){
				var pages = data.pages || [];
				applyPages(doc, bundleHelpers, pages);
			}
		};
	};
};

function applyPages(document, bundleHelpers, pages){
	var findBundle = bundleHelpers.findBundle;
	var bundles = bundleHelpers.bundles;

	var inserted = {};
	var head = document.head || document.body.getElementsByTagName("head")[0];

	pages.forEach(function(moduleName){
		var bundle = findBundle(moduleName) || bundles[moduleName];

		if(bundle) {
			Object.keys(bundle).forEach(function(childName){
				var asset = bundle[childName];
				if(asset && !inserted[asset.id]) {

					inserted[asset.id] = true;
					var node = asset.value();
					node.setAttribute("asset-id", asset.id);
					head.insertBefore(node, head.lastChild);
				}
			});
		}
	});
}
