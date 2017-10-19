var REEXECUTE_MAIN = Symbol("done-ssr-reexecutemain");
var MAIN_EXEC = Symbol("done-ssr-mainexec");
var npmModuleRegEx = /@.+\..+\..+#/;

module.exports = function(data){
	return {
		beforeStealStartup: function(){
			if(!data.steal.loader[REEXECUTE_MAIN]) {
				addReexecuteMain(data.steal.loader, data);
			}
		},
		afterStealDone: function(){
			var loader = data.steal.loader;
			if(loader[MAIN_EXEC]) {
				data.mainExecute = loader[MAIN_EXEC];
			}
		}
	};
};

function addReexecuteMain(loader, data) {
	loader[REEXECUTE_MAIN] = true;

	function getName() {
		return loader.main;
	}

	function isMain(name) {
		var main = getName();
		if(name === main) return true;
		var n = name.replace(npmModuleRegEx, "/");
		return main === n;
	}

	// For declarative modules (ES modules)
	interceptDeclaration(loader, getName, function(declare, args){
		var decl = declare.apply(this, args);
		loader[MAIN_EXEC] = decl.execute;
		return decl;
	});

	// For dynamic modules (cjs, amd, etc)
	var instantiate = loader.instantiate;
	loader.instantiate = function(load){
		if(isMain(load.name)) {
			var p = Promise.resolve(instantiate.apply(this, arguments));
			return p.then(function(result){
				if(result && result.execute) {
					var entry = loader.defined[load.name];
					loader[MAIN_EXEC] = makeDynamicExecuter(loader, entry);
				}
				return result;
			});
		} else {
			return instantiate.apply(this, arguments);
		}
	};

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

function makeDynamicExecuter(loader, entry) {
	var execute = entry.execute;
	var deps = entry.deps;
	var normalizedDeps = entry.normalizedDeps;
	var module = Object.assign({}, entry.module);

	return function(){
		module.exports = Object.create(null);
		var output = execute.call(loader.global, function(name) {
		for (var i = 0, l = deps.length; i < l; i++) {
			if (entry.deps[i] != name)
				continue;
			return loader.get(normalizedDeps[i]);
		}
		throw new TypeError('Module ' + name + ' not declared as a dependency.');
		}, exports, module);
	};
}
