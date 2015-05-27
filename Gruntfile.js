
module.exports = function(grunt){

	grunt.initConfig({
		simplemocha: {
			test: {
				src: ["test/test.js"]
			}
		},

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
			}

		}
	});

	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-simple-mocha");

	grunt.registerTask("test", ["copy", "simplemocha"]);
	grunt.registerTask("default", ["copy"]);
};
