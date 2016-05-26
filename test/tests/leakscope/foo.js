import Component from "can-component";
import stache from "can-stache";
import template from "./foo.stache";

export default Component.extend({
	template,
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
