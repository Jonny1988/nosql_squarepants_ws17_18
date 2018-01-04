const databaseConnection = require('../dbconnection/mariasql');
const securityController = require('../controllers/securityController');
const path = require("path");


navigateToView = function (request, response, viewname) {
    securityController.isSessionUser(request, response, function () {
        const con = databaseConnection.getCon();
        const sql = "Select * from users where username = \'" + request.session.username + "\';";
        con.query(sql, function (err, result, fields) {
            //if user is admin
            if (result[0].role == 0x15) {
                response.sendFile(path.join(__dirname + '/views/admin/' + viewname + '.html'));
            } else {
                response.sendFile(path.join(__dirname + '/views/student/' + viewname + '.html'));
            }
        });
    })
};

exports.getLoginView = function (request, response) {
    response.sendFile(path.join(__dirname + '/views/index.html'));
};

exports.getRegisterView = function (request, response) {
    this.getLoginView(request, response);
};
exports.getOverview = function (request, response) {
    navigateToView(request, response, 'overview');
};
exports.getCourseC = function (request, response) {
    navigateToView(request, response, 'createCourse');
};
exports.getCourseU = function (request, response) {
    navigateToView(request, response, 'updateCourse');
};
exports.getCourseD = function (request, response) {
    navigateToView(request, response, 'deleteCourse');
};

