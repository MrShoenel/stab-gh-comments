/* global console */
'use strict';
module.exports = function(grunt) {
	// Dynamically loads all required grunt tasks
	require('matchdep').filterDev('grunt-*')
		.forEach(grunt.loadNpmTasks);
	
	var buildPath = './build/stab.comments.github';
		
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		////////////////////////////////////////////////////////////////
		//
		// Now, this is the alphabetical list of grunt-tasks.
		// Note: The actual main-taks (default, watch etc.)
		//       are defined at the end of this file!
		//
		////////////////////////////////////////////////////////////////
		
		/**
		 * This task removes files or entire directories.
		 */
		clean: {
      all: ['./build/*'],
			nonUglified: [ buildPath ]
		},
		
		concat: {
			js: {
				options: {
					separator: grunt.util.linefeed
				},
				src: [ // it has to be like this so the order is maintained
					buildPath + '/stab.common.js',
					buildPath + '/transformers/articleWithComments.transformer.js',
					buildPath + '/module.js',
					buildPath + '/services/authorization.service.js',
					buildPath + '/services/user.service.js',
					buildPath + '/services/comments.service.js',
					buildPath + '/controllers/containerDirective.controller.js',
					buildPath + '/controllers/createPostDirective.controller.js',
					buildPath + '/directives/createPost.directive.js',
					buildPath + '/directives/container.directive.js'
				],
				dest: './build/stab.comments.github.js'
			}
		},

		/**
		 * Tasks to copy-over specific files to specific directories.
		 * This is usually the case if we copy something from ./resoure
		 * over to ./build.
		 */
		copy: {
			html: {
				files: [{
					src: './resource/stab.comments.github/auth.callback.html',
					dest: 'build/auth.callback.html'
				}]
			},

      js: {
				files: [{
					expand: true,
					cwd: './resource/',
					src: ['**/*.js'],
					dest: 'build/'
				}]
			},
			
			templates: {
				files: [{
					expand: true,
					cwd: './resource/',
					src: ['**/*template.html'],
					dest: 'build/'
				}]
			}
		},
		
		/**
		 * This task we use to compress the templates used by the comment module.
		 * This task is only used when --optimize is present.
		 */
		htmlclean: {
			options: { },
			templates: {
				expand: true,
				cwd: './build/',
				src: '**/*template.html',
				dest: './build/'
			}
		},
		
		/**
		 * Used to create compressed CSS files from LESS.
		 */
		less: {
			all: {
				options: {
					compress: true,
					plugins: [
						new (require('less-plugin-autoprefix'))({browsers : ["last 2 versions"]})
					]
				},
				files: (function() {
					// add file <=> file relation or have multiple files less'ed
					// into one file by using path expanders ({,*}*.less)
					var o = {};
					o[buildPath + '/style/style.css'] = ['./resource/**/*.less'];
					return o;
				})()
			}
		},
		
		/**
		 * This task is necessary because we use the uglifier and would
		 * break our code where it lacks proper ngAnnotatedConstructor-functions.
		 */
		ngAnnotate: {
			all: {
				options: {
					singleQuotes: true
				},
				files: [{
					expand: true,
					src: ['./build/**/*.js']
				}]
			}
		},
		
		/**
		 * This tasks checks our good style during development :) It uses
		 * the parameters defined in tslint.json.
		 */
		tslint: {
			options: {
				configuration: grunt.file.readJSON('tslint.json')
			},

			app: {
				files: {
					src: ['./resource/**/*.ts']
				}
			}
		},
		
		/**
		 * All TypeScript compilation tasks
		 */
		typescript: {
			app: {
				src: ['./resource/**/*.ts'],
				options: {
					module: 'amd',
					target: 'ES5',
					sourceMap: true,
					declaration: false // won't create *.d.ts files
				}
			}
		},
		
		/**
		 * This task compresses and concatenates the output in-place.
		 */
		uglify: {
			all: {
				options: {
					mangle: false,
					mangleProperties: false
				},
				files: {
					'./build/stab.comments.github.js': [ './build/stab.comments.github.js' ]
				}
			}
		},

		////////////////////////////////////////////////////////////////
		//
		// Below this line only main tasks, alphabetically (the tasks
		// from above are usually not called directly).
		//
		////////////////////////////////////////////////////////////////
		
		/**
		* All watchable tasks. The specified tasks will be run if
		* the files specified change.
		*/
		watch: {
			typescript: {
				files: ['./resource/**/*.ts'],
				tasks: ['newer:tslint:app', 'newer:typescript:app', 'newer:copy:js']
			}
    }
	});
	
	grunt.registerTask('includeCss', function() {
		var modulePath = buildPath + '/module.js',
			moduleContents = grunt.file.read(modulePath),
			cssContents = grunt.file.read(buildPath + '/style/style.css');
		
		moduleContents = moduleContents.replace(/var includedCss\s*?=\s*?'';/i,
			'var includedCss=\'' + cssContents.replace(/'/g, "\'") + '\';');
		
		grunt.file.write(modulePath, moduleContents);
	});
	
	grunt.registerTask('includeTemplates', function() {
		var templateFiles = grunt.file.expand('./build/**/*.template.html').map(function(path) {
			return {
				path: path,
				fileName: path.substring(path.lastIndexOf('/') + 1),
				content: JSON.stringify(grunt.file.read(path))
			};
		});
		
		var getTemplate = function(fileName) {
			return templateFiles.filter(function(t) { return t.fileName === fileName })[0];
		};
		
		grunt.file.expand('./build/**/*.js').forEach(function(path) {
			var tplRegex = /var\s+?__inline__template\s*?=\s*?'([a-z0-9\.]+)';?/ig;
			var jsFile = grunt.file.read(path);
			
			if (!/var\s+?__inline__template\s*?=\s*?'([a-z0-9\.]+)';?/ig.test(jsFile)) {
				return;
			}
			
			jsFile = jsFile.replace(tplRegex, function(all, tplName) {
				return 'var __inline__template=' + getTemplate(tplName).content + ';'
			});
			
			grunt.file.write(path, jsFile);
		});
		
		templateFiles.forEach(function(t) { grunt.file.delete(t.path); });
	});
	
	grunt.registerTask('optimize', [
		'ngAnnotate', 'includeCss', 'concat', 'uglify', 'clean:nonUglified'
	]);
  
  grunt.registerTask('default', (function(skipOptimize) {
		var tasks = [
			'clean', 'tslint', 'typescript', 'less', 'copy', 'htmlclean', 'includeTemplates'
		];
		if (!skipOptimize) {
			tasks.push('optimize');
		}
		return tasks;
	})(!!grunt.option('skip-optimize')));
  
  grunt.registerTask('watch-all', [
    'default',
    'watch'
  ]);
};
