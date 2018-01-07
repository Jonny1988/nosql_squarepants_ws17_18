require('../models/Course');
const securityService = require("../services/securityService");
const databaseConnection = require("../dbconnection/mariasql");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const con = databaseConnection.getCon();

const Course = mongoose.model('course');

// TODO
// der Controller sollte keine Ahnung haben von der databaseconnection
// Dies sollte im securityService follends übernommen werden
exports.login = function (request, response) {
    const username = request.body.username;
    const password = request.body.password;
    const con = databaseConnection.getCon();
    const sql = "SELECT * FROM users WHERE username = \'" + username + "\';";
    con.query(sql, function (err, result) {
        if (err) throw err;
        if (result[0] && result[0].username === username) {
            bcrypt.compare(password, result[0].password, function (err, isCorrectPassword) {
                if (!isCorrectPassword)
                    return response.send("Das eingegebene Passwort ist nicht korrekt");
                request.session.username = username;
                return response.redirect("/index/");
            });
        } else {
            response.send("Dieser Benutzername existiert nicht");
        }
    });
};

// TODO
// der Controller sollte keine Ahnung haben von der databaseconnection
// Dies sollte im securityService follends übernommen werden
exports.createUser = function (request, response) {
    if (request.body.password === request.body.passwordConf) {
        const user = request.body;
        con.query("SELECT * FROM users WHERE username = \'" + user.username + "\';", function (err, result) {
            if (err) throw err;
            if (result.length > 0)
                return response.send("Dieser Benutzer existiert bereits");
            con.query("SELECT * FROM users WHERE email = \'" + user.email + "\';", function (err, result) {
                if (err) throw err;
                if (result.length > 0)
                    return response.send("Diese E-Mail Adresse wird bereits verwendet");

                bcrypt.genSalt(saltRounds, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        let role = user.role == 'Admin' ? 0x15 : 0x25;
                        let sql =
                            "INSERT INTO users "
                            + "(username,surname,lastname,email,password,role) "
                            + "VALUES ("
                            + "\"" + user.username + "\", "
                            + "\"" + user.surname + "\", "
                            + "\"" + user.lastname + "\", "
                            + "\"" + user.email + "\", "
                            + "\"" + hash + "\", "
                            + "\"" + role + "\");";
                        con.query(sql, function (err, result) {
                            if (err) throw err;
                        });
                    });
                });
                response.sendStatus(200);
            });
        });
    } else {
        response.send("Die eingegebenen Passwörter stimmen nicht überein");
    }
};

// TODO
// Auch dies sollte fraglich an den security Service übergeben werden
exports.logout = function (request, response) {
    request.session.destroy();
    response.redirect("/login/");
};

exports.getLoginView = function (request, response) {
    response.render('login');
};

function getOverviewForAdmin(user, response) {
    let data = {user: user};
    Course.find({owner: user.username},
        function (err, courses) {
            if (err || !courses)
                return response.sendStatus(500);
            data.courses = courses;
            response.render('admin/index', data);
        });
}

function getOverviewForStudent(user, response) {
    let data = {user: user};
    Course.find({students: user.username},
        function (err, courses) {
            if (err || !courses)
                return response.sendStatus(500);
            data.courses = courses;
            response.render('student/index', data);
        });
}

exports.getOverView = function (request, response) {
    securityService.getSessionUser(request).then(function (user) {
        if (user.isAdmin)
            return getOverviewForAdmin(user, response);
        return getOverviewForStudent(user, response);
    }).catch(function () {
        response.sendStatus(403);
    });
};