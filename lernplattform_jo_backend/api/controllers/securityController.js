const databaseConnection = require('../dbconnection/mariasql');
const viewController = require('./viewController');

// TODO einkommentieren
exports.isSessionUserAdmin = function (request, response, executeMethod) {
    this.isSessionUser(request, response, function () {
        // const con = databaseConnection.getCon();
        // const sql = "Select * from users where username = \'" + request.session.username + "\';";
        // con.query(sql, function (err, result, fields) {
        //     if (result[0].role != 0x15) {
        //         console.log("Der Benutzer hat keine Adminrechte");
        //         response.sendStatus(403);
        //     }
        executeMethod(request, response);
        //     });
    });
};

exports.isSessionUser = function (request, response, executeMethod) {
    // try {
    //     if (request.session && request.session.username) {
            executeMethod(response, response);
    //     } else {
    //         console.log("Der Benutzer ist nicht eingelogt")
    //         response.sendStatus(403);
    //     }
    // } catch (err) {
    //     console.log(err);
    // }
};