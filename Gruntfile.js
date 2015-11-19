
module.exports = function(grunt){

	grunt.initConfig({
		copy: {
			toTest: {
				files: [{
					expand: true,
					src:["node_modules/can/**"],
					dest: "test/tests/",
					filter: "isFile"
				}, {
					expand: true,
					src:["node_modules/jquery/**"],
					dest: "test/tests/",
					filter: "isFile"

				}, {
					expand: true,
					src:["node_modules/done-autorender/**"],
					dest: "test/tests/",
					filter: "isFile"
				}, {
					expand: true,
					src:["node_modules/can-wait/**"],
					dest: "test/tests/node_modules/done-autorender/",
					filter: "isFile"
				}]
			},
			toReact: {
				files: [{
					expand: true,
					src:["node_modules/can/**"],
					dest: "test/tests/react/",
					filter: "isFile"
				}, {
					expand: true,
					src:["node_modules/jquery/**"],
					dest: "test/tests/react/",
					filter: "isFile"
				}, {
					expand: true,
					src:["node_modules/react/**"],
					dest: "test/tests/react/",
					filter: "isFile"
				}, {
					expand: true,
					src:["node_modules/react-dom/**"],
					dest: "test/tests/react/",
					filter: "isFile"
				}]
			},
			tojQuery: {
				files: [{
					expand: true,
					src:["node_modules/can/**"],
					dest: "test/tests/jquery/",
					filter: "isFile"
				}, {
					expand: true,
					src:["node_modules/jquery/**"],
					dest: "test/tests/jquery/",
					filter: "isFile"
				}]
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-copy");

	grunt.registerTask("default", ["copy"]);
};
