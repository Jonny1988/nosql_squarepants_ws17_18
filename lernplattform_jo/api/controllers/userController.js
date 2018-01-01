const databaseConnection = require('../dbconnection/mariasql');
const viewController = require('./viewController');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

require('../models/CourseStudents');
var courseStudents = mongoose.model('courseStudents');

exports.login = function (request, response) {
    const username = (request.body).username;
    const password = (request.body).password;
    const con = databaseConnection.getConnection();
    const sql = "Select * from users where username = \'" + username + "\';";
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        if (result[0] && result[0].username === username) {
            bcrypt.compare(password, result[0].password, function (err, isCorrectPassword) {
                if (isCorrectPassword) {
                    request.session.username = result[0].username;
                    request.session.role = result[0].role;
                    viewController.getOverview(request,response);
                } else {
                    viewController.redirectToLoginView(request, response, "Das eingegebene Passwort ist nicht korrekt..")
                }
            });
        } else {
            viewController.redirectToLoginView(request, response, "Dieser Benutzer existiert nicht.")
        }


    });
};

exports.createUser = function (request, response) {
    if (request.body.password === request.body.passwordConf) {
        const con = databaseConnection.getConnection();
        const user = request.body;
        con.query("SELECT * FROM users WHERE username = \'" + user.username + "\';", function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
                viewController.redirectToLoginView(request, response, "Der Benutzer " + request.body.username + " exisitiert bereits.")
            } else {
                con.query("SELECT * FROM users WHERE email = \'" + user.email + "\';", function (err, result) {
                    if (err) throw err;
                    if (result.length > 0) {
                        viewController.redirectToLoginView(request, response, "Die E-Mail Adresse wird bereits verwendet.")
                    } else {
                        bcrypt.genSalt(saltRounds, function (err, salt) {
                            bcrypt.hash(user.password, salt, function (err, hash) {
                                var role = user.role == 'Admin' ? 0x15 : 0x25;
                                var sql =
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
                        viewController.redirectToLoginView(request, response, "Benutzer " + request.body.username + " wurde angelegt.")
                    }
                });
            }
        });
    } else {
        response.send('Die eingegebenen Passwörte sind nicht identisch!');
    }
};

exports.logout = function (request, response) {
    request.session.destroy();
    viewController.loginView(request, response);
};

exports.getUser = function (request, reponse) {
    const username = request.username;
    //databaseConnection.getUser(username);
    reponse.send('get user by id');
};

exports.updateUser = function (request, response) {
    response.send('update user');
};