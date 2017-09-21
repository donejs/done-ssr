class Override {
	constructor(obj, name, fn) {
		this.oldValue = obj[name];
		this.obj = obj;
		this.name = name;
		this.value = fn(this.oldValue, this);
	}

	on(){
		this.update();
		this.obj[this.name] = this.value;
	}

	off() {
		this.obj[this.name] = this.oldValue;
	}

	update() {
		this.oldValue = this.obj[this.name];
	}
}

class Collection extends Array {
	on() {
		this.forEach(override => {
			override.on();
		});
	}

	off() {
		this.forEach(override => {
			override.off();
		});
	}
}

Override.global = function(name, value){
	return new Override(global, name, () => value);
};

Override.all = function(...args){
	var overrides = args.map(([name, value]) => {
		return Override.global(name, value);
	});

	return Reflect.construct(Collection, overrides);
};

module.exports = Override;
