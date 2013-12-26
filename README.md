#http2-test [![Build Status](https://travis-ci.org/http2/http2-test.png)](https://travis-ci.org/http2/http2-test)

Test Suite for HTTP/2 protocol.

The tests are divided into client and server tests. 

#Installation

The tests are written in JavaScript and run in the [node.js](http://nodejs.org/) JavaScript runtime
environment. As a first step, [download](http://nodejs.org/download/) and install node.js.

The test runner has several dependencies. These can be installed with `npm` (the Node Package
Manager, part of every node.js installation), with the following command issued in the root
directory of your clone of this git repo:

```bash
$ npm install
```

Furthermore, you'll also need `grunt-cli`:

```bash
$ npm install -g grunt-cli
```

#Usage

After installing the dependencies, run:

```bash
$ grunt mochaTest:client
```

A sample browser is included.

#Adding Tests

## Server tests
For server tests, create new tests as the `./lib/tests/*-test.js` directory. Look at the template-test.js for an example