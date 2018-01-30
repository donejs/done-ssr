var route = require("can-route");
require("can-route-pushstate");

route.register("", { page: "orders" });
route.register("{page}", { page: "orders" });
