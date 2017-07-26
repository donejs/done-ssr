import Component from "can-component";
import stache from "can-stache";
import view from "./foo.stache";

export default Component.extend({
	view,
	tag: 'app-foo',
	leakScope: false,

	viewModel: {
		baz: '<app-bar />'
	},

	helpers: {
		parse(snippet) {
			return stache(snippet)();
		}
	}
});
