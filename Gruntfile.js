'use strict';
var path = require('path');

module.exports = function (grunt) {
  require('time-grunt')(grunt);
  var bowerInfo = grunt.file.readJSON('bower.json');
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
        src: 'src/genie.js',
        dest: 'dist/genie.js'
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
    
    bumpup: 'bower.json',
    
    watch: {
      files: ['src/**/*', 'tests/**/*', 'Gruntfile.js'],
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
          module: false,
          define: false,
          window: false
        }
      },
      files: {
        src: ['src/genie.js']
      }
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

  grunt.registerTask('build', ['jshint', 'mocha', 'copy:dist', 'uglify']);
  grunt.registerTask('default', ['build']);

};
