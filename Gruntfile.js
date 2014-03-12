//Copyright (c) Microsoft Open Technologies, Inc. See LICENSE.txt for licensing information.

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	grunt.initConfig({
		jshint: {
			options: {

			},
			all: {
				src: ['lib/**/*.js', 'Gruntfile.js']
			}
		},
		mochaTest: {
			options: {
				reporter: 'dot',
				timeout: 8000
			},
			client: {
				src: ['./lib/client/**/*.spec.js']
			},
			server: {
				src: ['./lib/server/index.js']
			},
		}
	});

	grunt.registerTask('build', ['jshint']);
	grunt.registerTask('test', ['build', 'mochaTest:client', 'mochaTest:server']);
	grunt.registerTask('default', ['test']);
};
