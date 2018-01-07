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
app.use(express.static('public'));
app.set('view engine', 'ejs');

//session management
const options = {
    client: 'mysql',
    connection: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'userdb'
    },
    table: 'sessions',
    expires: 365 * 24 * 60 * 60 * 1000 // 1 year in ms
};

const sessionStore = new SessionStore(options);

app.use(session({
    key: 'user_id',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: true,
    saveUninitialized: true
}));

//App Config
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Map global promise -> get ride of Warnings (When you habe depreciationsWarning on console)
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/lernplattform', {
    useMongoClient:true
}).then(() => console.log('MongoDB Connectec...'))
.catch(err => console.log(err));
//routes
const router = require('./api/services/router');

router(app);

app.get('/*',function (req, res) {
    res.sendStatus(404);
});

app.listen(port);

console.log('Server listening on Port: ' + port);