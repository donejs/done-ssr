
module.exports = function(data){
	var inserted = new Set();

	return {
		plugins: [
			require("./trace-bundles"),
			require("./can-import")
		],

		beforeRun: function(){
			data.applyPages = function(){
				var pages = data.pages || [];
				return applyPages(data.document, data.bundleHelpers,
					pages, inserted);
			};
		},

		afterStealMain: function(){
			ensureAtLeastMainPage(data);
			data.applyPages();
		},

		ended: function(){
			ensureAtLeastMainPage(data);

			// If anything is added, update the HTML
			if(data.applyPages()) {
				data.html = data.document.documentElement.outerHTML;
			}
		}
	};
};

function applyPages(document, bundleHelpers, pages, inserted){
	var findBundle = bundleHelpers.findBundle;
	var bundles = bundleHelpers.bundles;

	var head = document.head;
	if (!head) {
		console.info('document.head:', head);
		console.info('bundles:', bundles);
		console.info('document.documentElement:', document.documentElement);
		if (document.documentElement) {
			console.info('document.documentElement.innerHTML:', document.documentElement.innerHTML);
		}
		console.info('global.document:', global.document);
		if (global.document && global.document.documentElement) {
			console.info('global.document.documentElement.innerHTML:', global.document.documentElement.innerHTML);
		}
	}

	var changes = 0;
	var oldDoc = global.document;
	global.document = document;
	pages.forEach(function(moduleName){
		var bundle = findBundle(moduleName) || bundles[moduleName];

		if(bundle) {
			Object.keys(bundle).forEach(function(childName){
				var asset = bundle[childName];
				if(asset && !inserted.has(asset.id)) {
					changes++;
					inserted.add(asset.id);
					var node = asset.value();
					node.setAttribute("asset-id", asset.id);
					if (head) {
						head.insertBefore(node, head.lastChild);
					} else {
						console.info('no head:', head);
					}
				}
			});
		}
	});
	global.document = oldDoc;
	return changes;
}

function ensureAtLeastMainPage(data) {
	if(!data.pages) {
		data.pages = [];
	}
	// If no bundles are found, put the main one in anyways, so some
	// styles are at least added
	if(data.pages.length === 0) {
		var loader = data.steal.loader;
		data.pages.unshift(loader.normalizedMain);
	}
}
