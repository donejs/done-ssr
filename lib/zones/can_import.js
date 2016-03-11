module.exports = function(data){

	// If this is not a CanJS project
	if(typeof can === "undefined" || !can.view) {
		return {};
	}

	var oldCanImport;

	var canImport = function(el, tagData){
		var moduleName = el.getAttribute("from");
		var templateModule = tagData.options.attr("helpers.module");
		var parentName = templateModule ? templateModule.id : undefined;

		var isAPage = !!tagData.subtemplate;
		var loader = doneSsr.loader;
		loader.normalize(moduleName, parentName).then(function(name){
			if(isAPage) {
				loader.__ssrParentMap[name] = false;
			}
			var pages = data.pages;
			if(!pages) {
				pages = data.pages = [];
			}
			pages.push(name);
		});

		oldCanImport.apply(this, arguments);
	};

	return {
		beforeTask: function(){
			oldCanImport = can.view.callbacks._tags["can-import"];
			can.view.callbacks._tags["can-import"] = canImport;
		},
		afterTask: function(){
			can.view.callbacks._tags["can-import"] = oldCanImport;
		}
	};
};
