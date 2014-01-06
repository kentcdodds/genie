'use strict';
var path = require('path');

module.exports = function (grunt) {
  var bowerInfo = grunt.file.readJSON('bower.json');
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

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
      files: ['genie.js', 'test/*.js', 'Gruntfile.js'],
      tasks: ['mocha', 'jshint']
    },
    
    jshint: {
      options: {
        unused: true,
        undef: true,
        curly: true,
        forin: true,
        eqeqeq: true,
        immed: true,
        freeze: true,
        latedef: true,
        newcap: true,
        noarg: true,
        noempty: true,
        nonew: true,
        maxcomplexity: 4,
        strict: true,
        indent: 2,
        maxdepth: 3,
        quotmark: 'single',
        trailing: true,
        globals: {
          define: false,
          window: false
        }
      },
      files: {
        src: ['genie.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-bumpup');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('build', ['jshint', 'mocha', 'uglify']);
  grunt.registerTask('default', ['build']);

};
