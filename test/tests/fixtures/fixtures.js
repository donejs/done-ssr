var fixture = require("can-fixture");

var store = fixture.store([
	{ id: 3, text: "three" },
	{ id: 4, text: "four" }
]);

fixture({
  'GET /stuff': store.findAll,
  'GET /stuff/{id}': store.findOne,
  'POST /stuff': function (req, res){
  	return ""+Math.random();
  },
  'PUT /stuff/{id}': store.update,
  'DELETE /stuff/{id}': store.destroy
});

fixture.delay = 20;

module.exports = store;
