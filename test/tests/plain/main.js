import AppViewModel from "plain/appstate";
import $ from "jquery";

import importPage from "can-ssr/import";
import "plain/routes";

import headTemplate from "plain/head.stache!";
import bodyTemplate from "plain/body.stache!";

var pages = {
	"home": "<home-page></home-page",
	"orders": "<order-history></order-history>"
};

export default function(request){
	var props = can.route.deparam(location.pathname);
	var state = new AppViewModel(props);

	$(document.head).html(headTemplate(state));
	var body = $(document.body);
	body.html(bodyTemplate(state));

	var page = state.attr("page");
	var module = "plain/" + page + "/";

	importPage(module).then(function(){
		body.find("#app").html(
			can.stache(pages[page])(state)
		);
	});
}
