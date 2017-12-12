import Component from 'can-component';
import view from './bar.stache';

export default Component.extend({
	view,
	leakScope: false,
	tag: 'app-bar'
});
