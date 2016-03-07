import AppViewModel from "./appstate";
import $ from "jquery";

import importPage from "can-ssr/import";
import "./routes";

import headTemplate from "./head.stache!";
import bodyTemplate from "./body.stache!";

export let viewModel = AppViewModel;

var pages = {
	"home": "<home-page></home-page",
	"orders": "<order-history></order-history>"
};

export function render(doc, state){
	$(doc.head).html(headTemplate(state));
	var body = $(doc.body);
	body.html(bodyTemplate(state));

	var page = state.attr("page");
	var module = "plain_state/" + page + "/";

	importPage(module).then(function(){
		body.find("#app").html(
			can.stache(pages[page])(state)
		);
	});
}
