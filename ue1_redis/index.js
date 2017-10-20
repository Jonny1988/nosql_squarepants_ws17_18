const redis = require('redis');
const client = redis.createClient();

var express = require('express');
var app = express();

app.get('/*', function (req, res) {
	res.writeHead(200, {'ContentType': 'text/plain'});
	var responseMessage;
	client.get(req.url.replace('/',''), function(err , object){
		responseMessage = object;
		console.log("object from db: %s ",object);
		res.end( responseMessage );
	});
});

var server = app.listen(8080, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

});