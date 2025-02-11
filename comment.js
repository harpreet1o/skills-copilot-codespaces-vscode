//create web server
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

//send 404 error
function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}

//send file data
function sendFile(response, filePath, fileContents) {
	response.writeHead(
		200,
		{"content-type": mime.getType(path.basename(filePath))}
	);
	response.end(fileContents);
}

//read from file
function serveStatic(response, cache, absPath) {
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
			if (exists) {
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}

//create http server
var server = http.createServer(function(request, response) {
	var filePath = false;

	if (request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}

	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
});

//start server
server.listen(3000, function() {
	console.log("Server listening on port 3000.");
});

//set up socket.io server
var chatServer = require('./lib/chat_server');
chatServer.listen(server);