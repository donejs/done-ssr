import route from "can-route";
import "can-route-pushstate";

import AppViewModel from "./appstate";

import $ from "jquery";
import stache from "can-stache";

import importPage from "done-ssr/import";

import headTemplate from "./head.stache";
import bodyTemplate from "./body.stache";

route(":page", { page: "home" });

var pages = {
	"home": "<home-page></home-page",
	"orders": "<order-history></order-history>"
};

export default function(request){
	var props = route.deparam(location.pathname);
	var state = new AppViewModel(props);
	route.map(state);

	$(document.head).html(headTemplate(state));
	var body = $(document.body);
	body.html(bodyTemplate(state));

	var page = state.attr("page");
	var module = "plain/" + page + "/";

	importPage(module).then(function(){
		body.find("#app").html(
			stache(pages[page])(state)
		);
	});
}
