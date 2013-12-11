'use strict'

module.exports = function(grunt) {
    
	require('load-grunt-tasks')(grunt);
	grunt.initConfig({
		mochaTest: {
			options: {
				reporter: 'dot',
				timeout: 20000
			},
			client: {
				src: ['./lib/client/index.js']
			},			
		}
	});

	grunt.registerTask('default', ['mochaTest:client']);
}