import Component from "can-component";
import stache from "can-stache";
import view from "./foo.stache";
import DefineMap from "can-define/map/map";

var ViewModel = DefineMap.extend({
	baz: {
		value: "<app-bar />"
	}
});

export default Component.extend({
	view,
	tag: 'app-foo',
	leakScope: false,
	ViewModel,

	helpers: {
		parse(snippet) {
			return stache(snippet)();
		}
	}
});
