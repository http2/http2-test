#http2-test

Test Suite for HTTP/2 protocol.

The tests are divided into client and server tests. 

#Usage
Install all node modules and run `grunt mochaTest:client`. A sample browser is also included.
#Adding Tests

## Server tests
For server tests, create new tests as the `./lib/tests/*-test.js` directory. Look at the template-test.js for an example