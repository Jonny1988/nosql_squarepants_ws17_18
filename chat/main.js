var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require("socket.io")(server);
var session = require("express-session")({
		secret: "my-secret",
		resave: true,
		saveUninitialized: true,
		cookie: {
			secure: false,
			maxAge: 600000
		}
	});
var	sharedsession = require("express-socket.io-session");
var amqp = require('amqplib/callback_api');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//var session = require('express-session');

var regExIsLettersOnly = /^[a-zA-Z\s]+$/

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(session);
io.use(sharedsession(session));

app.use(urlencodedParser);
app.use(cookieParser());
server.listen(80);

app.use(express.static('public'));



function connect(doStuff) {
	amqp.connect('amqp://localhost', function(err, conn) {
		conn.createChannel(function(err, ch) {
			doStuff(conn, ch);
		});
	});
}
function erstelleChannel(channel) {
	
	
}


io.on('connection', function(socket) {
	var userName = socket.handshake.session.name;
	
	console.log("login to Socket for ", userName);
	connect(function(conn, ch) {
		// teile Client mit dass wir nun ready sind
		socket.emit('connected');
		
		// nun dürfen Befehle zum Channel abhören kommen
		socket.on('listen', function(name) {
			if (!name.match(regExIsLettersOnly))
				return;
			var channel = 'channel.' + name;
			console.log(userName + " listens to " + channel);
			
			// erstelle die Exchange ( alle queues / USer hören auf diese Exchange ) sofern noch nicht vorhanden.
			ch.assertExchange(channel, 'fanout', {durable: true});
			// Erstelle Durable QUeue DIE alle NAchrichten abspeichert und dis auch durable macht.
			// während die anderen Qeueus alles annonym sind und nur für einen aktiven user aktiv sind.
			// auch hier gilt : ist die Queue schon existent passiert hier nichts.
			ch.assertQueue(channel, {durable: true}, function(err, q) {
				// binde die queue an dem Exchange
				ch.bindQueue(q.queue, channel, '');
				// Wir consumieren hier auch jede Nachericht, aber diesmal wollen wir consume sobald beenden wenn wir die alten Nachriten alle haben daher :
				// den automatisch generieten conSUmerTag rasufinden und am ende aller messages dieses consume beenden ( ICh hab einfach keine bessere lösung gefunden... )
				// noAck : lösche die NAchrichten nicht aus der Queue die sollen ja dort für immer sein..
				// exclusive : diese QUeue dürfen von mehreren gleichzeitig gelesen werden ( dies sollte nur ganz selten vorkommen da wir sie sofort wieder schleißen )
				var messages = 0;
				var consumerTag;
				console.log("So viele messages gibt es : "+q.messageCount);
				if (q.messageCount <= 0)
					return;
				ch.consume(q.queue, function(msg) {
					var message = JSON.parse(msg.content.toString());
					console.log("lese nachricht aus der persisterenden Queue : "+message.message);
					socket.emit('channel', {name: name, msg: message});
					messages ++;
					if (messages == q.messageCount) {
						console.log("wirf "+consumerTag+" raus");
						ch.cancel(consumerTag);
					}
				}, {noAck: false, exclusive: true}, function(err, ok) {
					consumerTag = ok.consumerTag;
				});
			});
			// Erstellen einer anonymen Queue ( name fehlt ) welche exclusive ist -> sie geht nach der connection down..
			// diese Queue ist nur für den User zuständig. da ein User nur zur gleichen Zeit eine QUeue consumen kann..
			ch.assertQueue('', {exclusive: true}, function(err, q) {
				console.log(userName + " is in Queue " + q.queue);
				// binde die queue an dem Exchange
				ch.bindQueue(q.queue, channel, '');
				// consumieren heißt dass er alle nAchrichten liest sobald eine neue Nachricht eintrifft.
				// dabei sind aber logischweise die alten Nachrichten VOR dem connecten nicht in der queue.
				ch.consume(q.queue, function(msg) {
					var message = JSON.parse(msg.content.toString());
					socket.emit('channel', {name: name, msg: message});
				});
			});
		});
		
		// wenn der nutzer etwas chatten will
		socket.on('chat', function(data) {
			if (!data.name.match(regExIsLettersOnly))
				return;
			var channel = 'channel.' + data.name;
			// theoretisch müssten wir hier nicht nochmal die assertExchnage machen, dies erstelt nur die Exchnage wenn sie noch nicht da ist
			// Da wir hier aber nur sein könnten wenn wir auch mindestens einmal den channel zuhören... better save than sorry
			ch.assertExchange(channel, 'fanout', {durable: true});
			var msg = new Buffer(JSON.stringify({user : userName, message: data.message}));
			// publish = schreibe message dem Echange ( nicht der queue direkt )
			// persitent damit sie auch auf der Festplatte gespeichert wird ... ist total dumm das bei jeder nachricht indiiviuell zu machen ...
			ch.publish(channel, '', msg, {persistent: true});
			
			console.log("chatting ", data);
		});
		
		socket.on("disconnect", function() {
			console.log(userName + " logout from Socket");
			// vrbindung unterbrochen ? dann bricht channel wie verbdinung ab. ( dies klappt nicht immer aber sollte reichen.. )
			ch.close(function() {conn.close()});
		});
	});
});
/**
	"Channel:default" <- 
	"Channel:hans" <-
	"Chat:Name1:Name2" <- 

*/

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message
    });
});

app.get('/', function (req, res) {
	// zum testen ...
	if (!req.session.name) {
		// zum testen sind wir anfänglich immer der hans...
		req.session.name = "Hans";
		req.session.save();
	}
	if (!req.session.name) {
		// Da kommen wir logischerweise im testfall nie rein :D
		res.redirect(307, '/login');
	} else {
		res.sendFile(__dirname + "/html/index.html");
	}
});

app.get('/login', function(req, res) {
	console.log("opne login side");
	res.sendFile( __dirname + "/html/login.html" );
});

app.post('/login', function(req, res) {
	if (!req.body.name)
		return next(new Error("Invalid Querry"));
	if (!req.body.name.match(regExIsLettersOnly))
		return next(new Error("User Name must be letters only"));
	req.session.name = req.body.name;
	req.session.save();
	console.log("anmeldungund so", req.session.name);
});
app.get('/index', function (req, res) {
	if (!req.query.name)
		return next(new Error("Invalid Querry"));
	if (!req.query.name.match(regExIsLettersOnly))
		return next(new Error("User Name must be letters only"));
	console.log("go index with ", req.query.name);
	res.sendFile(__dirname + "/html/index.html");
});

// ka was derr urlencodedParser macht ....
app.get('/channel', urlencodedParser, function (req, res, next) {
	if (!req.query.name)
		return next(new Error("Invalid Querry"));
	if (!req.query.name.match(regExIsLettersOnly))
		return next(new Error("Channel Name must be letters only"));
	
	res.setHeader("Content-Type", "application/json");
	response = [];
	
	amqp.connect('amqp://localhost', function(err, conn) {
	  // ka was ein channel macht
	  conn.createChannel(function(err, ch) {
		var channel = 'channel.' + req.query.name;
		console.log("wurst macht get auf "+channel);
		// queue initialisieren falls sie noch nicht exisiteirt ansonsten einfach nur ranhängen
		ch.assertQueue(channel, {durable: true}, function(err, status) {
			if (err)
				throw new Error(err)
			var counter = 0;
			// consume heißt : alles von der queue laden da sie durable: true ist bekommen wir hier sofort alle alten Nachrichten.
			// ansonten triggert die funtion sobald eine neue nachricht ankommt.
			 ch.consume(channel, function(msg) {
				  var message = JSON.parse(msg.content.toString());
				  console.log(message);
				  response.push(message);
				  counter++;
				  if (counter >= status.messageCount){
					res.send(JSON.stringify(response));
					ch.close(function() {conn.close()})
				  }
			 });
		});
		
		//setInterval(function() { 
		//	ch.sendToQueue(channel, new Buffer(JSON.stringify({user : "Hans", message: "Some funny Message"})), {persistent: true}); 
		//}, 1000);
	  });
	  
	});
});

app.post('/channel', urlencodedParser, function(req, res, next) {
	if (!req.body.name || !req.body.user || !req.body.message)
		return next(new Error("Invalid Body"));
	if (!req.body.name.match(regExIsLettersOnly))
		return next(new Error("Channel Name must be letters only"));
	if (!req.body.user.match(regExIsLettersOnly))
		return next(new Error("User must be letters only"));
	var channel = 'channel.' + req.body.name;
	amqp.connect('amqp://localhost', function(err, conn) {
	  // ka was ein channel macht
		conn.createChannel(function(err, ch) {
			ch.assertQueue(channel, {durable: true}, function(err, status) {
				ch.sendToQueue(channel, new Buffer(
					JSON.stringify({user : req.body.user, message: req.body.message})
				), {persistent: true}); 
			});
		});
	});
});



