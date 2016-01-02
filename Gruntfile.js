/* global console */
'use strict';
module.exports = function(grunt) {
	// Dynamically loads all required grunt tasks
	require('matchdep').filterDev('grunt-*')
		.forEach(grunt.loadNpmTasks);
		
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
			nonUglified: ['./build/**/*', '!./build/stab.comments.github.js'],
			includedCss: ['./build/**/*.css']
		},

		/**
		 * Tasks to copy-over specific files to specific directories.
		 * This is usually the case if we copy something from ./resoure
		 * over to ./public.
		 */
		copy: {
      js: {
				files: [{
					expand: true,
					cwd: './resource/',
					src: ['**/*.js'],
					dest: 'build/'
				}]
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
				files: {
					// add file <=> file relation or have multiple files less'ed
					// into one file by using path expanders ({,*}*.less)
					'./build/stab.comments.github.css': ['./resource/**/*.less']
				}
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
				mangle: true,
				mangleProperties: true,
				files: {
					'./build/stab.comments.github.js': ['./build/**/*.js']
				}
				//files: grunt.file.expandMapping(['./build/**/*.js'], './')
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
		var moduleContents = grunt.file.read('./build/stab.comments.github.module.js'),
			cssContents = grunt.file.read('./build/stab.comments.github.css');
		
		moduleContents = moduleContents.replace(/var includedCss\s*?=\s*?'';/i,
			'var includedCss=\'' + cssContents.replace(/'/g, "\'") + '\'');
		
		grunt.file.write('./build/stab.comments.github.js', moduleContents);
		
		// removed the now included CSS files:
		grunt.task.run('clean:includedCss');
	});
	
	grunt.registerTask('optimize', [
		'ngAnnotate', 'includeCss', 'uglify', 'clean:nonUglified'
	]);
  
  grunt.registerTask('default', (function(includeOptimize) {
		var tasks = [
			'clean', 'tslint', 'typescript', 'less', 'copy'
		];
		if (includeOptimize) {
			tasks.push('optimize');
		}
		return tasks;
	})(!!grunt.option('optimize')));
  
  grunt.registerTask('watch-all', [
    'default',
    'watch'
  ]);
};
