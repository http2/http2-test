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

You'll also need `grunt-cli`:

```bash
$ npm install -g grunt-cli
```

#Usage

## Testing the client

After installing the dependencies, as described above, set the envrinoment variable HTTP2_BROWSER to the client executable. Note that the client should be able to parse a URL in its command line. Then run 

```bash
$ grunt mochaTest:client
```

To try out the tests, a sample browser is included. This is picked up if the HTTP2_BROWSER environment variable does not exist. Note that currently, the client is expected to directly connect with the HTTP2 protocol and no upgrade is used. ALPN as a negotiation will be added soon. 

## Testing the server

> This is still a work in progress and there are no tests available currently. 

#Adding Tests

## Server tests
For server tests, create new tests as the `./lib/tests/*-test.js` directory. Look at the template-test.js for an example

NOTE WELL
---------

Any submission to the [IETF](http://www.ietf.org/) intended by the Contributor
for publication as all or part of an IETF Internet-Draft or RFC and any
statement made within the context of an IETF activity is considered an "IETF
Contribution". Such statements include oral statements in IETF sessions, as
well as written and electronic communications made at any time or place, which
are addressed to:

 * The IETF plenary session
 * The IESG, or any member thereof on behalf of the IESG
 * Any IETF mailing list, including the IETF list itself, any working group 
   or design team list, or any other list functioning under IETF auspices
 * Any IETF working group or portion thereof
 * Any Birds of a Feather (BOF) session
 * The IAB or any member thereof on behalf of the IAB
 * The RFC Editor or the Internet-Drafts function
 * All IETF Contributions are subject to the rules of 
   [RFC 5378](http://tools.ietf.org/html/rfc5378) and 
   [RFC 3979](http://tools.ietf.org/html/rfc3979) 
   (updated by [RFC 4879](http://tools.ietf.org/html/rfc4879)).

Statements made outside of an IETF session, mailing list or other function,
that are clearly not intended to be input to an IETF activity, group or
function, are not IETF Contributions in the context of this notice.

Please consult [RFC 5378](http://tools.ietf.org/html/rfc5378) and [RFC 
3979](http://tools.ietf.org/html/rfc3979) for details.

A participant in any IETF activity is deemed to accept all IETF rules of
process, as documented in Best Current Practices RFCs and IESG Statements.

A participant in any IETF activity acknowledges that written, audio and video
records of meetings may be made and may be available to the public.
