'use strict';
var path = require('path');

module.exports = function (grunt) {
  var bowerInfo = grunt.file.readJSON('bower.json');
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Mocha
    mocha: {
      all: {
        src: ['test/testrunner.html']
      },
      options: {
        run: true
      }
    },
    uglify: {
      options: {
        banner: [
          '/** ',
          bowerInfo.name + ' - v' + bowerInfo.version + ' @license',
          '(c) <%= grunt.template.today("yyyy-mm-dd") %> - ' + bowerInfo.authors.join('| '),
          bowerInfo.description,
          'Freely distributed under the ' + bowerInfo.license + ' license',
          bowerInfo.homepage
        ].join('\n * ') + '\n */\n'
      },
      all: {
        files: {
          'genie.min.js': ['genie.js']
        }
      }
    },
    bumpup: 'bower.json',
    watch: {
      files: ['genie.js', 'test/*.js'],
      tasks: ['mocha']
    }
  });

  // Load grunt mocha task
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-bumpup');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['mocha', 'uglify']);
  grunt.registerTask('default', ['build']);

};
