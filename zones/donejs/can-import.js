var canData = require("can-util/dom/data/data");

module.exports = function(data){
	var oldCanImport, can;

	var canImport = function(el, tagData){
		var moduleName = el.getAttribute("from");
		var templateModule = tagData.options.get("helpers.module");
		var parentName = templateModule ? templateModule.id : undefined;

		var isAPage = !!tagData.subtemplate;
		var loader = data.steal.loader;
		var res = loader.normalize(moduleName, parentName);
		var pagePromise = Promise.resolve(res).then(function(name){
			if(isAPage) {
				loader.__ssrParentMap[name] = false;
			}
			var pages = data.pages;
			if(!pages) {
				pages = data.pages = [];
			}
			pages.push(name);
		});
		canData.set.call(el, "pageNormalizePromise", pagePromise);

		oldCanImport.apply(this, arguments);
	};

	return {
		afterStealDone: function(){
			can = data.modules.can;
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
			}

		}
	};
};
