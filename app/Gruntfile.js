var pkg = require('./package.json');

module.exports = function(grunt){
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.util.linefeed = '\n';
    grunt.initConfig({
        pkg: pkg,
        dist: '../static/app',
        filename: pkg.name,
        meta: {
            banner: ['/*',
                     ' * <%= pkg.name %>',
                     ' * Version: <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
                     ' */\n'].join('\n')
        },
        htmlhint: {
            build: {
                options: {
                    'tag-pair': true,
                    'tagname-lowercase': true,
                    'attr-lowercase': true,
                    'attr-value-double-quotes': true,
                    'doctype-first': false,
                    'spec-char-escape': true,
                    'id-unique': true,
                    'head-script-disabled': true,
                    'style-disabled': true
                },
                src: ['src/js/**/*.html']
            }
        },
        jshint: {
            files: ['Gruntfile.js','src/js/**/*.js','!src/js/partials/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        html2js: {
            'app-base': {
                src: ['src/js/**/*.html'],
                dest: 'src/js/partials/templates.html.js'
            }
        },
        concat: {
            dist: {
                options: {
                    banner: '<%= meta.banner %>\n',
                    srcMap: true
                },
                src: [
                    '../node_modules/app-container/angular/dist/app-container-common.js',
                    '../node_modules/user-resource-container/angular/dist/app-container-user.js',
                    '../node_modules/odata-resource-file/angular/odata-resource-file.js',
                    '../node_modules/file-resource-container/angular/dist/app-container-file.js',
                    '../node_modules/geo-resource-container/angular/dist/app-container-geo.js'
                ], // list generated in build.
                dest: '<%= dist %>/<%= filename %>.js'
            },
            thirdParty: {
                src: [
                    'node_modules/jquery/dist/jquery.js',
                    'node_modules/bootstrap-sass/assets/javascripts/bootstrap.js',
                    'node_modules/d3/build/d3.js',
                    'node_modules/angular/angular.js',
                    'node_modules/angular-resource/angular-resource.js',
                    'node_modules/angular-route/angular-route.js',
                    'node_modules/angular-sanitize/angular-sanitize.js',
                    'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
                    'node_modules/angular-simple-logger/dist/angular-simple-logger.js',
                    'node_modules/angular-google-maps/dist/angular-google-maps.js'
                ],
                dest: '<%= dist %>/<%= filename %>-3rdparty.js'
            }
        },
        uglify: {
            dist:{
                options: {
                    banner: '<%= meta.banner %>'
                },
                src:['<%= concat.dist.dest %>'],
                dest:'<%= dist %>/<%= filename %>.min.js'
            },
            thirdParty: {
                src:['<%= dist %>/<%= filename %>-3rdparty.js'],
                dest:'<%= dist %>/<%= filename %>-3rdparty.min.js'
            }
        },
        copy: {
            thirdParty: {
                files: [{
                    expand: true,
                    src: '**',
                    cwd: 'node_modules/font-awesome/fonts',
                    dest: '<%= dist %>/fonts'
                },{
                    expand: true,
                    src: '**',
                    cwd: 'node_modules/bootstrap-sass/assets/fonts',
                    dest: '<%= dist %>/fonts'
                }]
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    '<%= dist %>/css/<%= filename %>.css': 'src/css/app.scss'
                }
            }
        },
        delta: {
            html: {
                files: ['src/js/**/*.html'],
                tasks: ['html2js', 'after-test']
            },
            js: {
                files: ['src/js/**/*.js',
                        '../node_modules/app-container/angular/dist/app-container-common.js',
                        '../node_modules/user-resource-container/angular/dist/app-container-user.js',
                        '../node_modules/odata-resource-file/angular/odata-resource-file.js',
                        '../node_modules/file-resource-container/angular/dist/app-container-file.js',
                        '../node_modules/geo-resource-container/angular/dist/app-container-geo.js'],
                tasks: ['jshint','after-test']
            },
            css: {
                files: ['src/css/*.scss'],
                tasks: ['after-test']
            }
        }
    });

    grunt.registerTask('before-test',['htmlhint','jshint','html2js']);
    grunt.registerTask('after-test',['sass','build']);
    grunt.renameTask('watch','delta');
    grunt.registerTask('watch',['before-test', 'after-test', 'delta']);
    grunt.registerTask('default', ['before-test', /*'test',*/ 'after-test']);
    grunt.registerTask('thirdParty',['concat:thirdParty','uglify:thirdParty','copy:thirdParty']);

    grunt.registerTask('build',function() {
        var jsSrc = [];
        // there is no semblance of order here so need to be careful about
        // dependencies between .js files
        grunt.file.expand({filter: 'isFile', cwd: '.'}, 'src/js/**')
             .forEach(function(f){
                if(f.search(/\.js$/) > 0 && f.search(/\.spec\.js$/) === -1) {
                    jsSrc.push(f);
                }
             });
        grunt.config('concat.dist.src', grunt.config('concat.dist.src').concat(jsSrc));
        grunt.task.run(['concat:dist','uglify:dist']);
    });
};
