module.exports = function(grunt) {    
    
    this.uglifyOptions = {
		dead_code: true,
		conditionals: true,
		evaluate: true,
		unused: true,
		join_vars: true,
		drop_console: true,
		drop_debugger: true,
		comparisons: true,
		booleans: true,
		loops: true,
		if_return: true
	};
	
	grunt.initConfig({
        cssmin: {
			dist: {
				files: {
					"dist/toolslide.min.css": [
						"dist/toolslide.css"
					]
				}
			}
		},
		concat: {
			js: {
				src: [
					"src/main.js"
				],
				dest: "dist/toolslide.js"
			},
            css: {
				src: [
					"src/main.css"
				],
				dest: "dist/toolslide.css"
			}
		},
		umd: {
            dist: {
                options: {
                    src: "dist/toolslide.js",
                    dest: "dist/toolslide.js",
                    globalAlias: "toolslide",
                    deps: {}
                }
            }
        },
        uglify: {
            dist: {
                files: [{
                    "dist/toolslide.min.js": ["dist/toolslide.js"]
                }],
                compress: this.uglifyOptions
            }
        },
        
        _clean: {
            build: {
                src: ["dist/"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-umd");
    grunt.renameTask("clean", "_clean");

    var cleanTask = ["_clean"];
    var buildTask = ["_clean", "concat", "cssmin", "umd", "uglify"];
    
    grunt.registerTask("default", buildTask);
    grunt.registerTask("clean", cleanTask);
    grunt.registerTask("build", buildTask);
};