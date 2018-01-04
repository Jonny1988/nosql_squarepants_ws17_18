const databaseConnection = require('../dbconnection/mariasql');

function getUser(username) {
    const con = databaseConnection.getCon();
    const sql = "Select * from users where username = \'" + username + "\';";
    return new Promise(function(resolve, reject) {
        con.query(sql, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result[0]);
            }
        });
    });

}

exports.getSessionUser = function (request) {
    return new Promise(function(resolve, reject) {
        try {
            getUser(request.session.username).then(function (user) {
                resolve(user.role == 0x15);
            }).catch(function (err) {
                reject(err);
            });
        } catch (err) {
            reject(err);
        }
    });
};