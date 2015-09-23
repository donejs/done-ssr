
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
				}]
			},
			toLive: {
				files: [{
					expand: true,
					src:["node_modules/can/**"],
					dest: "test/tests/live/",
					filter: "isFile"
				}, {
					expand: true,
					src:["node_modules/jquery/**"],
					dest: "test/tests/live/",
					filter: "isFile"

				}, {
					expand: true,
					src:["node_modules/done-autorender/**"],
					dest: "test/tests/live/",
					filter: "isFile"
				}]
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-copy");

	grunt.registerTask("default", ["copy"]);
};
