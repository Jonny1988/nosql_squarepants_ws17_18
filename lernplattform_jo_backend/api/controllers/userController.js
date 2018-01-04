const securityController = require("../controllers/securityController")
const databaseConnection = require("../dbconnection/mariasql")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const con = databaseConnection.getCon();

exports.login = function (request, response) {
    const username = (request.body).username;
    const password = (request.body).password;
    const con = databaseConnection.getCon();
    const sql = "Select * from users where username = \'" + username + "\';";
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        if (result[0] && result[0].username === username) {
            bcrypt.compare(password, result[0].password, function (err, isCorrectPassword) {
                if (isCorrectPassword) {
                    request.session.username = username;
                    response.sendStatus(200);
                } else {
                    response.send("Das eingegebene Passwort ist nicht korrekt");
                }
            });
        } else {
            response.send("Dieser Benutzername existiert nicht");
        }


    });
};

exports.createUser = function (request, response) {
    if (request.body.password === request.body.passwordConf) {
        const user = request.body;
        con.query("SELECT * FROM users WHERE username = \'" + user.username + "\';", function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
                response.send("Dieser Benutzer existiert bereits");
            } else {
                con.query("SELECT * FROM users WHERE email = \'" + user.email + "\';", function (err, result) {
                    if (err) throw err;
                    if (result.length > 0) {
                        response.send("Diese E-Mail Adresse wird bereits verwendet");
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
                        response.sendStatus(200)
                    }
                });
            }
        });
    } else {
        response.send("Die eingegebenen Passwörter stimmen nicht überein");
    }
};

exports.logout = function (request, response) {
    request.session.destroy();
    response.sendStatus(200);
};

exports.getAllStudents = function(request,response){
    securityController.isSessionUserAdmin(request,response, function () {
        const getAllStudents = "Select * from users where role =" + 37 + ";";
        con.query(getAllStudents, function (err, availableStudents, fields) {
            if(err) response.sendStatus(500);
           response.send(availableStudents);
        });
    });
};