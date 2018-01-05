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

/**
 * Holt den derzeitigen Session User und returned ein Promise
 * mit boolean isAdmin und String username
 */
exports.getSessionUser = function (request) {
    return new Promise(function(resolve, reject) {
        try {
            getUser(request.session.username).then(function (user) {
                resolve(user.role == 0x15, user.username);
            }).catch(function (err) {
                reject(err);
            });
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Hollt sich den derzeitigen User in der Session und wirft
 * eine response.sendStatus 500 wenn dieser nicht existiert.
 * Ist checkForAdmin gesetzt so wird auch zusätzlich gefragt ob der
 * User Admin ist.
 * Returned ein Promise mit boolean isAdmin und String username
 * Man kann den Error auch catchen, dies funktioniert aber nach dem
 * response.sendStatus(500)
 */
exports.isSessionUser = function(request, response, checkForAdmin) {
    return new Promise(function(resolve, reject) {
        this.getSessionUser(request).then(function (isAdmin, username) {
            if (!checkForAdmin || isAdmin)
                resolve(isAdmin, username);
            else {
                response.sendStatus(500);
                reject();
            }
        }).catch(function(err) {
            response.sendStatus(500);
            reject(err);
        })
    })
}