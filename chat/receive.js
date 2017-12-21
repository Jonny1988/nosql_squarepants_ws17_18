
var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = 'channel.default';
    var msg = process.argv.slice(2).join(' ') || 'Hello World!';
	
	// redo old queue
	ch.assertQueue(ex, {durable: true}, function(err, status) {
		if (err) {
            throw new Error(err)
		}
		console.log(status);
		 ch.consume(ex, function(msg) {
              var resChunk = msg.content.toString();
		 });
	});
	
	setInterval(function() { 
		ch.sendToQueue(ex, new Buffer(msg), {persistent: true}); 
	}, 1000);
  });
  
});