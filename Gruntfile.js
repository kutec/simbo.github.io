module.exports = function(grunt) {
    'use strict';

    // Load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    // Force use of Unix newlines
    grunt.util.linefeed = '\n';

    /* =============================================================================
       Grunt config
       ========================================================================== */

    grunt.initConfig({

        /* =============================================================================
           Get npm data
           ========================================================================== */

        pkg: grunt.file.readJSON('package.json'),

        /* =============================================================================
           Task config: Clean
           ========================================================================== */

        clean: {
            site: [
                '_site/*'
            ],
            deps: [
                'assets/fonts/*',
                'assets/less/vendor/*',
                'assets/js/vendor/*'
            ],
            css: [
                'assets/css/*'
            ],
            js: [
                'assets/js/*',
                '!assets/js/vendor/**'
            ]
        },

        /* =============================================================================
           Task config: Update json
           ========================================================================== */

        update_json: {
            bower: {
                src: 'package.json',
                dest: 'bower.json',
                fields: [
                    'name',
                    'version',
                    'description'
                ]
            }
        },

        /* =============================================================================
           Task config: Copy dependency files
           ========================================================================== */

        copy: {
            normalize: {
                src: 'bower_components/normalize-css/normalize.css',
                dest: 'assets/less/vendor/normalize-css/normalize.less'
            },
            fontawesome_fonts: {
                src: 'bower_components/font-awesome/fonts/*',
                dest: 'assets/fonts/',
                expand: true,
                flatten: true
            },
            fontawesome_less: {
                src: 'bower_components/font-awesome/less/*',
                dest: 'assets/less/vendor/font-awesome/',
                expand: true,
                flatten: true
            },
            pygments_less: {
                src: 'bower_components/pygments-css/github.css',
                dest: 'assets/less/vendor/pygments-css/github.less'
            },
            jquery: {
                expand: true,
                src: 'bower_components/jquery/dist/jquery.min.*',
                dest: 'assets/js/vendor/jquery/',
                flatten: true
            },
            dev_less: {
                expand: true,
                src: 'assets/css/*',
                dest: '_site/assets/css/',
                flatten: true
            },
            dev_coffee: {
                expand: true,
                src: 'assets/js/*',
                dest: '_site/assets/js/',
                flatten: true
            }
        },

        /* =============================================================================
           Task config: LESS
           ========================================================================== */

        less: {
            theme: {
                options: {
                    strictMath: true,
                    sourceMap: true,
                    outputSourceFiles: true,
                    report: 'min',
                    compress: true,
                    sourceMapURL: 'styles.min.css.map',
                    sourceMapFilename: 'assets/css/styles.min.css.map'
                },
                files: {
                    'assets/css/styles.min.css': 'assets/less/styles.less'
                }
            }
        },

        /* =============================================================================
           Task config: Autoprefixer
           ========================================================================== */

        autoprefixer: {
            options: {
                browsers: [
                    'last 2 versions',
                    'ie 9',
                    'android 2.3',
                    'android 4',
                    'opera 12'
                ],
                map: true
            },
            core: {
                src: 'assets/css/styles.min.css'
            },
        },

        /* =============================================================================
           Task config: Coffeescript
           ========================================================================== */

        coffee: {
            options: {
                separator: 'linefeed',
                bare: true,
                join: false,
                sourceMap: true
            },
            compile: {
                files: {
                    'assets/js/scripts.js': [
                        'assets/coffee/main.coffee'
                    ]
                }
            }
        },

        /* =============================================================================
           Task config: JSHint
           ========================================================================== */

        jshint: {
            options: {
                'indent': 2
            },
            js: {
                src: 'assets/js/scripts.js'
            },
            grunt: {
                options: {
                    'indent': 4
                },
                src: 'Gruntfile.js'
            }
        },

        /* =============================================================================
           Task config: Uglify
           ========================================================================== */

        uglify: {
            js: {
                files: {
                    'assets/js/scripts.min.js': [
                        'bower_components/lunr.js/lunr.js',
                        'assets/js/scripts.js'
                    ]
                },
                options: {
                    sourceMap: true
                }
            }
        },

        /* =============================================================================
           Task config: jekyll
           ========================================================================== */

        jekyll: {
            options: {
                bundleExec: true,
                config: '_config.yml'
            },
            build: {
            },
            serve: {
                options: {
                    serve: true
                }
            }
        },

        /* =============================================================================
           Task config: watch
           ========================================================================== */

        watch: {
            json: {
                files: [
                    'package.json'
                ],
                tasks: [
                    'build-json',
                    'notify:json'
                ]
            },
            less: {
                files: [
                    'assets/less/*.less'
                ],
                tasks: [
                    'build-css',
                    'copy:dev_less',
                    'notify:less'
                ],
                options: {
                    livereload: true
                }
            },
            coffee: {
                files: [
                    'assets/coffee/*.coffee'
                ],
                tasks: [
                    'build-js',
                    'copy:dev_coffee',
                    'notify:coffee'
                ],
                options: {
                    livereload: true
                }
            },
            grunt: {
                files: [
                    'Gruntfile.js'
                ],
                tasks: [
                    'jshint:grunt',
                    'notify:grunt'
                ]
            },
            jekyll: {
                files: [
                    '**/*.html',
                    '**/*.md',
                    '**/*.xml',
                    'lunr.data',
                    '_config.yml',
                    '!**/_site/**',
                    '!**/demo/**',
                    '!**/node_modules/**',
                    '!**/bower_components/**'
                ],
                tasks: [
                    'build-jekyll',
                    'notify:jekyll'
                ],
                options: {
                    livereload: true
                }
            }
        },

        /* =============================================================================
           Task config: concurrent
           ========================================================================== */

        concurrent: {
            target: {
                tasks: ['jekyll:serve', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        /* =============================================================================
           Task config: notifications
           ========================================================================== */

        notify: {
            json: {
                options: {
                    title: 'JSON Update',
                    message: 'Merged bower.json with package.json.'
                }
            },
            less: {
                options: {
                    title: 'LESS',
                    message: 'CSS generated and minified.'
                }
            },
            coffee: {
                options: {
                    title: 'Coffeescript',
                    message: 'Javascript generated and minified.'
                }
            },
            grunt: {
                options: {
                    title: 'Gruntfile',
                    message: 'No hints.'
                }
            },
            jekyll: {
                options: {
                    title: 'Jekyll',
                    message: 'Site generated.'
                }
            }
        }

    });

    /* =============================================================================
       Custom tasks
       ========================================================================== */

    grunt.registerTask( 'copy-deps', [
        'clean:deps',
        'copy:normalize',
        'copy:fontawesome_fonts',
        'copy:fontawesome_less',
        'copy:pygments_less',
        'copy:jquery'
    ]);
    grunt.registerTask( 'build-json', [
        'update_json'
    ]);
    grunt.registerTask( 'build-css', [
        'clean:css',
        'less',
        'autoprefixer'
    ]);
    grunt.registerTask( 'build-js', [
        'clean:js',
        'coffee',
        'jshint:js',
        'uglify'
    ]);
    grunt.registerTask( 'build-jekyll', [
        'clean:site',
        'jekyll:build'
    ]);
    grunt.registerTask( 'build', [
        'build-json',
        'copy-deps',
        'build-css',
        'build-js',
        'build-jekyll'
    ]);
    grunt.registerTask( 'serve', [
        'jekyll:serve'
    ]);
    grunt.registerTask( 'dev', [
        'concurrent'
    ]);
    grunt.registerTask( 'default', [
        'build',
        'dev'
    ]);

};
