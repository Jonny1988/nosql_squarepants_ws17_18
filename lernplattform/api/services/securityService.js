const databaseConnection = require('../dbconnection/mariasql');

function getUser(username) {
    const con = databaseConnection.getCon();
    const sql = "Select * from users where username = \'" + username + "\';";
    return new Promise(function (resolve, reject) {
        con.query(sql, function (err, result) {

            if (err) {
                reject(err);
            } else if (!result[0])
                reject(new Error("Kein User mit dem Namen gefunden"));
            else {
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
    return new Promise(function (resolve, reject) {
        try {
            getUser(request.session.username).then(function (user) {
                resolve({isAdmin: user.role == 0x15, username: user.username});
            }).catch(function (err) {
                reject(err);
            });
        } catch (err) {
            reject(err);
        }
    });
};

// TODO
// Dies hat nciht wirklich was mit dem securitySerrvice zu tun.
// Es ist eher eine Funktion die ein ein Utils oder so reingehört.
/**
 * Hollt sich den derzeitigen User in der Session und wirft
 * eine response.sendStatus 401 wenn dieser nicht existiert.
 * Ist checkForAdmin gesetzt so wird auch zusätzlich gefragt ob der
 * User Admin ist.
 * Returned ein Promise mit boolean isAdmin und String username
 * Man kann den Error auch catchen, dies funktioniert aber nach dem
 * response.sendStatus(401)
 */
exports.isSessionUser = function (request, response, checkForAdmin) {
    return new Promise(function (resolve, reject) {
        exports.getSessionUser(request).then(function (user) {
            if (!checkForAdmin || user.isAdmin)
                resolve(user);
            else {
                response.sendStatus(403);
                reject();
            }
        }).catch(function (err) {
            response.sendStatus(401);
            reject(err);
        })
    })
}