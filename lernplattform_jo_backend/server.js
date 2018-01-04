const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SessionStore = require('express-sql-session')(session);
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');



app = express();
port = process.env.PORT || 3000;


// default options
app.use(fileUpload());

//session management
var options = {
    client: 'mysql',
    connection: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'userdb'
    },
    table: 'sessions',
    expires: 365 * 24 * 60 * 60 * 1000 // 1 year in ms
};

var sessionStore = new SessionStore(options);

app.use(session({
    key: 'user_id',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: true,
    saveUninitialized: true
}));

//App Config
app.use(bodyParser());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Map global promise -> get ride of Warnings (When you habe depreciationsWarning on console)
mongoose.Promise = global.Promise;
//Connect your database to mongoose
mongoose.connect('mongodb://localhost/lernplatform', {
    useMongoClient:true
    //use Promises or callback methode. I will use promises with arrow function
})
    .then(() => console.log('MongoDB Connectec...'))
.catch(err => console.log(err));
//routes
var router = require('./api/routes/router');

router(app);

app.get('/*',function (req, res) {
    res.sendStatus(404);
});

app.listen(port);

console.log('Server listening on Port: ' + port);