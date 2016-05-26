
exports.get = function(obs, key){
	if(typeof obs.attr === "function") {
		return obs.attr(key);
	} else {
		return obs[key];
	}
};

exports.set = function(obs, key, value){
	if(typeof obs.attr === "function") {
		obs.attr(key, value);
	} else {
		obs[key] = value;
	}
};
