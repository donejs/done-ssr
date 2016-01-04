import AppViewModel from "plain/appstate";
import $ from "jquery";

import importPage from "can-ssr/import";
import "plain/routes";

import headTemplate from "plain/head.stache!";
import bodyTemplate from "plain/body.stache!";

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
	var module = "plain/" + page + "/";

	importPage(module, { name: System.main }).then(function(){
		body.find("#app").html(
			can.stache(pages[page])(state)
		);
	});
}
