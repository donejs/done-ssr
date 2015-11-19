module.exports = makeMap;

function makeMap(instance){
	if(looksLikeAMap(instance)) {
		return instance;
	}

	return {
		attr: function(key, value){
			if(!value && typeof key !== "object") {
				return instance[key];
			} else {
				return setState(instance, key, value);
			}
		}
	};
}

function looksLikeAMap(instance) {
	return !!(instance.attr && instance.bind);
}

function setState(instance, key, value) {
	if(looksLikeAMap(instance)) {
		// It's an object
		if(!value) {
			instance.attr(key);
		} else {
			instance.attr(key, value);
		}
	} else {
		if(!value) {
			Object.keys(key).forEach(function(k){
				instance[k] = key[k];
			});
		} else {
			instance[key] = value;
		}
	}
}

