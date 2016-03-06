// Intercept a setter, once
exports.once = function(obj, prop, cb){
	var desc = Object.getOwnPropertyDescriptor(obj, prop);
	Object.defineProperty(obj, prop, {
		set: function(val){
			cb(val);
			Object.defineProperty(obj, prop, desc);
		}
	});
};
