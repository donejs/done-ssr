import Component from 'can/component/';
import template from './bar.stache!';

export default Component.extend({
	template,
	leakScope: false,
	tag: 'app-bar'
});
