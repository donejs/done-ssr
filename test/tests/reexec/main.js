// Just exists for ES module detection
export function doStuff(){}

var div = document.createElement("div");
div.setAttribute("class", "content");
div.textContent = "My Content";

document.body.appendChild(div);
