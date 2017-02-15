/*
 * grunt-csssplit
 * https://github.com/robotlovesyou/grunt-csssplit
 *
 * Copyright (c) 2014 Andrew Smith
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        'tests/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    csssplit: {
        test: {
            cwd: 'test/fixtures',
            src: 'glob/**/*.css',
            dest: 'tmp',
            flatten:false,
            expand:true,
            options: {
              maxSelectors: 2,
              maxPages: 2
            }
        },
        testFlatten: {
            cwd: 'test/fixtures',
            src: 'flatten/*.css',
            expand:true,
            flatten:true,
            dest: 'tmp',
            options: {
              maxSelectors: 2,
              maxPages: 2
            }
        },
        suppress: {
            cwd: 'test/fixtures',
            src: 'suppress/*.css',
            expand: true,  
            dest: 'tmp',
            options: {
              suppressSinglePage: true
            }
        },
        dontsuppress: {
            cwd: 'test/fixtures',
            src: 'dontsuppress/*.css',
            expand: true,  
            dest: 'tmp',
            options: {
              suppressSinglePage: false
            }
        },
        testExtension: {
            cwd: 'test/fixtures',
            src: 'extension/*',
            expand:true,
            flatten:false,
            dest: 'tmp',
            options: {
              maxSelectors: 2,
              maxPages: 2
            }
        }
    },
    mochaTest: {
        test: {
            options: {
                reporter: 'spec'
            },
            src: 'test/*.js'
        }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-test');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'csssplit', 'mochaTest']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
