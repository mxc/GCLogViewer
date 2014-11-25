'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    app: 'public_html',
    dist: 'dist',

    sass: {
      dist: {
        options: {
          outputStyle: 'extended',
          includePaths: ['<%= app %>/bower_components/bootstrap-sass-official/assets/stylesheets/']
        },
        files: {
          '<%= app %>/css/style.css': '<%= app %>/scss/style.scss'
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= app %>/js/**/*.js'
      ]
    },

    clean: {
      dist: {
        src: ['<%= dist %>/*']
      },
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          cwd:'<%= app %>/',
          src: ['images/**', 'fonts/**', '**/*.html', '!**/*.scss', '!bower_components/**'],
          dest: '<%= dist %>/'
        }]
      },
    },

    uglify: {
      options: {
        preserveComments: 'some',
        mangle: false
      }
    },

    useminPrepare: {
      html: ['<%= app %>/index.html'],
      options: {
        dest: '<%= dist %>'
      }
    },

    usemin: {
      html: ['<%= dist %>/**/*.html', '!<%= app %>/bower_components/**'],
      css: ['<%= dist %>/css/**/*.css'],
      options: {
        dirs: ['<%= dist %>']
      }
    },

    watch: {
      grunt: {
        files: ['Gruntfile.js'],
        tasks: ['sass']
      },
      sass: {
        files: '<%= app %>/scss/**/*.scss',
        tasks: ['sass']
      },
      livereload: {
        files: ['<%= app %>/**/*.html', '!<%= app %>/bower_components/**', '<%= app %>/js/**/*.js', '<%= app %>/css/**/*.css', '<%= app %>/images/**/*.{jpg,gif,svg,jpeg,png}'],
        options: {
          livereload: true
        }
      }
    },

    connect: {
      app: {
        options: {
          port: 9000,
          base: '<%= app %>/',
          open: true,
          livereload: true,
          hostname: '127.0.0.1'
        }
      },
      dist: {
        options: {
          port: 9001,
          base: '<%= dist %>/',
          open: true,
          keepalive: true,
          livereload: false,
          hostname: '127.0.0.1'
        }
      }
    },

    wiredep: {
      target: {
        src: [
          '<%= app %>/**/*.html'
        ],
        exclude: [
          'affix.js',
          'alert.js',
          'button.js',
          'carousel.js',
          'collapse.js',
          'dropdown.js',
          'tab.js',
          'transition.js',
          'scrollspy.js',
          'modal.js',
          'tooltip.js',
          'popover.js'
        ]
      }
    }

  });

  grunt.registerTask('compile-sass', ['sass']);
  grunt.registerTask('bower-install', ['wiredep']);
  grunt.registerTask('default', ['compile-sass', 'bower-install', 'connect:app', 'watch']);
  grunt.registerTask('validate-js', ['jshint']);
  grunt.registerTask('server-dist', ['connect:dist']);
  grunt.registerTask('publish', ['compile-sass', 'clean:dist', 'validate-js', 'useminPrepare', 'copy:dist', 'concat', 'cssmin', 'uglify', 'usemin']);

};
