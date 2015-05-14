var route = require("can/route/route");
require("can/route/pushstate/pushstate");

route(":page", { page: "home" });
