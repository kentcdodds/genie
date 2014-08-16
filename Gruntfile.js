'use strict';
var path = require('path');

module.exports = function (grunt) {
  require('time-grunt')(grunt);
  var bowerInfo = grunt.file.readJSON('bower.json');
  var unimplementedLamps = ['!*/dojo/**/*', '!*/ember/**/*', '!*/react/**/*', '!*/vanilla/**/*'];
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    mocha: {
      all: {
        src: ['tests/testrunner.html']
      },
      options: {
        run: true
      }
    },

    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['**/*.js', '!**/*Spec.js'].concat(unimplementedLamps),
            dest: 'dist/'
          }
        ]
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
          'dist/genie.min.js': ['src/genie.js']
        }
      }
    },
    
    bumpup: ['package.json', 'bower.json'],
    
    watch: {
      files: ['src/**/*', 'tests/**/*', 'Gruntfile.js'],
      tasks: ['mocha', 'jshint']
    },
    
    jshint: {
      src: ['src/**/*.js']
    },

    'gh-pages': {
      options: {
        base: 'demo'
      },
      src: ['**']
    }
  });

  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-bumpup');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('buildNoUgly', ['jshint', 'mocha', 'copy:dist']);
  grunt.registerTask('deploy', ['buildNoUgly', 'gh-pages']);

  grunt.registerTask('build', ['buildNoUgly', 'uglify']);
  grunt.registerTask('default', ['build']);

};
