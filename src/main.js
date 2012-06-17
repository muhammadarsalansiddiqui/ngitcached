/*******************************************************************************
**
** Copyright (C) 2012 Rohan McGovern <rohan@mcgovern.id.au>
** 
** Permission is hereby granted, free of charge, to any person obtaining a copy
** of this software and associated documentation files (the "Software"), to deal
** in the Software without restriction, including without limitation the rights
** to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
** copies of the Software, and to permit persons to whom the Software is
** furnished to do so, subject to the following conditions:
** 
** The above copyright notice and this permission notice shall be included in all
** copies or substantial portions of the Software.
** 
** THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
** IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
** FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
** AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
** LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
** OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
** SOFTWARE.
**
*******************************************************************************/

"use strict";

var git_port = process.env.NGITCACHED_GIT_PORT;
var http_port = process.env.NGITCACHED_HTTP_PORT;
var https_port = process.env.NGITCACHED_HTTPS_PORT;

if (process.env.NGITCACHED_PROCESS_TITLE) {
  process.title = process.env.NGITCACHED_PROCESS_TITLE;
}

var net = require('net');
var http = require('http');
var _ = require('underscore');
var mylog = require('./log.js');

var gitproxy = require('./gitproxy.js');
gitproxy = new gitproxy.GitProxy();
_.bindAll(gitproxy);

var exitOnSignal = function () {
  mylog.log(0, 'Exiting gracefully due to signal.');
  process.exit(0);
};
process.on('SIGINT', exitOnSignal);
process.on('SIGTERM', exitOnSignal);
process.on('SIGHUP', gitproxy.dumpInfo);

/*
    Avoid death on any uncaught exceptions.
    However, we aim to catch all exceptions, so this is always a bug.
    In test mode, this is disabled, so we die as soon as an error occurs.
*/
if (!process.env.NGITCACHED_TEST) {
  process.addListener('uncaughtException', function (err) {
    mylog.trace(0, 'Uncaught exception (bug in ngitcached): ' + err);
  });
}

net.createServer(gitproxy.handleGitConnect).listen(git_port, function () {
  mylog.log(0, 'ngitcached git:// proxy listening on port ' + git_port);
});
http.createServer(gitproxy.handleHttpConnect).listen(http_port, function () {
  mylog.log(0, 'ngitcached http:// proxy listening on port ' + http_port);
});
//net.createServer(gitproxy.handleHttpsConnect).listen(https_port, function () {
//  mylog.log(0, 'ngitcached https:// proxy listening on port ' + https_port);
//});

// vim: expandtab:ts=2:sw=2
