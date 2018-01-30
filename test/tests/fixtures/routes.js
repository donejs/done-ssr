var route = require("can-route");
require("can-route-pushstate");

route.register("{page}", { page: "home" });
