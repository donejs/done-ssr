import React from "react";
import ReactDOM from "react-dom";

let FutureMessage = React.createClass({
	getInitialState: function(){
		var component = this;
		setTimeout(function(){
			component.setState({ msg: "Hello from the future" });
		}, 200);

		return {
			msg: ""
		};
	},

	render: function(){
		return <div id="future">{this.state.msg}</div>
	}
});

let PresentMessage = React.createClass({
  render: function() {
    return <div id="present">Hello from the present</div>;
  }
});

let Main = React.createClass({
	render: function() {
		return (<div id="main">
			<PresentMessage />
			<FutureMessage />
		</div>);
	}
});

export function createState() {
	return {};
}

export function render(document){
	var div = document.createElement("div");
	document.body.appendChild(div);
	ReactDOM.render(<Main />, div);
}

var isNode = typeof process === "object" && {}.toString.call(process) ===
	"[object process]";

if(!isNode) {
	render(document);
}
