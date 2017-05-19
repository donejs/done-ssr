var route = require("can-route");
require("can-route-pushstate");

route("", { page: "orders" });
route("{page}", { page: "orders" });
