var route = require("can-route");
require("can-route-pushstate");

route(":page", { page: "home" });
