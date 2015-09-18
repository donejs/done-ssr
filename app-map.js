steal("can/util", "can/map", "can/compute", function(can){

	var CanMap = can.Map;

	function sortedSetJson(set){
		if(set == null) {
			return set;
		} else {
			var sorted = {};

			var keys = [];
			for(var k in set){
				keys.push(k);
			}
			keys.sort();
			can.each(keys, function(prop){
				sorted[prop] = set[prop];
			});
			return JSON.stringify(sorted);
		}
	}

	can.AppMap = can.Map.extend({
		setup: function(){
			can.Map.prototype.setup.apply(this, arguments);
			this.__readyPromises = [];
			this.__pageData = {};

			if(typeof System !== "undefined" && System.has("asset-register")) {
				var register = System.get("asset-register")["default"];
				var self = this;
				register("inline-cache", function(){
					var script = document.createElement("script");
					var jsonString = JSON.stringify(self.__pageData);
					var dataString = jsonString.replace(/(<\/?)script/g, "$1scr\"+\"ipt");
					var text = document.createTextNode("\nINLINE_CACHE = " + dataString + ";\n")
					script.appendChild(text);
					return script;
				});
			}
		},
		waitFor: function(promise){
			this.__readyPromises.push(promise);
			return promise;
		},
		pageStatus: function(statusCode, message) {
			this.attr({
				statusCode: statusCode,
				statusMessage: message
			});

			return this;
		},
		pageData: can.__notObserve(function(key, set, inst){
			var appState = this;

			function store(data){
				var keyData = appState.__pageData[key];
				if(!keyData) keyData = appState.__pageData[key] = {};

				keyData[sortedSetJson(set)] = typeof data.serialize === "function" ?
					data.serialize() : data;
			}

			if(can.isDeferred(inst)){
				this.waitFor(inst);
				inst.then(function(data){
					store(data);
				}, function(xhr) {
					appState.attr({
						statusCode: xhr.status || 500,
						statusMessage: xhr.statusText
					});
				});
			} else {
				store(inst);
			}

			return inst;
		}),
		serialize: function(){
			var data = CanMap.prototype.serialize.apply(this, arguments);
			delete data.statusCode;
			delete data.statusMessage;
			return data;
		}
	});

	return can.AppMap;

});
