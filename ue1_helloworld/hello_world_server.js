const http = require('http');

http.createServer(function(req, res){
	res.writeHead(200, {'ContentType': 'text/plain'});
	res.end('Hello World');
}).listen(8080);