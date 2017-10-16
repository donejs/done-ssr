var REEXECUTE_MAIN = Symbol("done-ssr-reexecutemain");

module.exports = function(data){
	return {
		beforeStealStartup: function(){
			if(!data.steal.loader[REEXECUTE_MAIN]) {
				addReexecuteMain(data.steal.loader, data);
			}
		}
	};
};

function addReexecuteMain(loader, data) {
	loader[REEXECUTE_MAIN] = true;

	function getName() {
		return loader.main;
	}

	interceptDeclaration(loader, getName, function(declare, args){
		var decl = declare.apply(this, args);
		data.mainExecute = decl.execute;
		return decl;
	});

}

function interceptDeclaration(loader, getName, callback) {
	var push = loader._loader.loads.push;
	loader._loader.loads.push = function(load){
		if(load.name === getName()) {
			var _val;
			Object.defineProperty(load, "declare", {
				get: function() { return _val; },
				set: function(val){
					if(typeof val === "function") {
						_val = function(){
							return callback.call(this, val, arguments);
						};
					} else {
						_val = val;
					}
				}
			})
		}

		return push.apply(this, arguments);
	};
}
