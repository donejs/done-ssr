import Component from 'can/component/';
import template from './foo.stache!';
import stache from 'can/view/stache/';

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
