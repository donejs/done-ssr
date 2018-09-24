
// A good enough XHR object
module.exports = function(responseFN, options){
	options = options || {};
	if(typeof responseFN === "string") {
		var responseText = responseFN;
		responseFN = function(){
			return responseText;
		};
	}
	var XHR = function(){
		this.onload = null;
		this.__events = {};
		this.__headers = {};
	};
	var realSetTimeout = global.setTimeout;
	XHR.prototype.addEventListener = function(ev, fn){
		var evs = this.__events[ev] = this.__events[ev] || [];
		evs.push(fn);
	};
	XHR.prototype.setRequestHeader = function(name, value){
		this.__headers[name] = value;
	};
	XHR.prototype.getRequestHeader = function(name){
		return this.__headers[name];
	};
	XHR.prototype.getResponseHeader = function(){};
	XHR.prototype.open = function(){};
	XHR.prototype.send = function(){
		var onload = this.onload;
		var onerror = this.onerror;
		var xhr = this;
		realSetTimeout(function(){
			if(options.error) {
				callEvents(xhr, "error");
				if(onerror) {
					onerror({ target: xhr });
				}
				return;
			}

			xhr.responseText = responseFN();
			onload({ target: xhr });
			callEvents(xhr, "load");
		}, 40);
		if (options.beforeSend) {
			options.beforeSend(this);
		}
	};
	function callEvents(xhr, ev) {
		var evs = xhr.__events[ev] || [];
		evs.forEach(function(fn){
			fn.call(xhr);
		});
	}
	XHR.prototype.setDisableHeaderCheck = function(){};
	XHR.prototype.getAllResponseHeaders = function(){
		return "Content-Type: application/json";
	};
	return XHR;
};
