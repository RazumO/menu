'use strict';

var express = require('express'),
  http = require('http'),
  path = require('path'),
  app = express(), 
  server = http.createServer(app);

const PROXY_SERVER_PORT = 5000;

app.get('/', function(req, res) {
  res.sendfile('src/index.html');
});

app.use(express.static('src'));

server.listen(PROXY_SERVER_PORT, 'localhost');
server.on('listening', function() {
  console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});