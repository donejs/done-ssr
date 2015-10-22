import React from "react";
import ReactDOM from "react-dom";

let HelloMessage = React.createClass({
  render: function() {
    return <div>Hello {this.props.name}!</div>;
  }
});

export function createState() {
	return {};
}

export function render(document){
	var div = document.createElement("div");
	document.body.appendChild(div);
	ReactDOM.render(<HelloMessage name="World" />, div);
}
