const databaseConnection = require('../dbconnection/mariasql');
const path = require("path");

exports.getOverview = function (request, response) {
    navigateToView(request, response, 'overview');
};

exports.editParticipant = function (request, response) {
    navigateToView(request, response, 'editParticipant');
}
exports.results = function (request, response) {
    navigateToView(request, response, 'results');
}

exports.redirectToLoginView = function (request, response, message) {
    const file = "<!DOCTYPE html>\n" +
        "<html lang=\"en\">\n" +
        "<head>\n" +
        "    <meta charset=\"UTF-8\">\n" +
        "    <title>Title</title>\n" +
        "<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js\"></script>" +
        "</head>\n" +
        "<body>\n" +
        "<p>" + message + "</p>" +
        "<p> Sie werden in 2 Sekunden weiter geleitet</p>" +
        "</body>\n" +
        "<script>$(document).ready(function(event){window.setTimeout(function(){\n" +
        "window.location.href = \"http://localhost:3000\";\n" +
        "    }, 2000);});</script>" +
        "</html>";
    response.send(file);
};

exports.loginView = function (request, response) {
    getStandardView(request, response);
};

getStandardView = function (request, response) {
    response.sendFile(path.join(__dirname + '/views/index.html'));
};

navigateToView = function (request, response, view) {
    if (request.session && request.session.username) {
        const con = databaseConnection.getConnection();
        const sql = "Select * from users where username = \'" + request.session.username + "\';";
        con.query(sql, function (err, result, fields) {
            //if user is admin
            if (result[0].role == 0x15) {
                response.sendFile(path.join(__dirname + '/views/frontend/admin/' + view + '.html'));
            } else {
                response.sendFile(path.join(__dirname + '/views/frontend/student/' + view + '.html'));
            }
        });
    } else {
        getStandardView(request, response);
    }
};

exports.menu = function(request,response) {
    navigateToView(request,response,"menu");
};
exports.createTest = function(request,response) {
    navigateToView(request,response,"createTest");
};
exports.choice = function(request,response) {
    navigateToView(request,response,"choice");
};
exports.upload = function(request,response) {
    navigateToView(request,response,"upload");
};
exports.createTheme = function(request,response) {
    navigateToView(request,response,"createTheme");
};

exports.createCourseView = function (request, response) {
    navigateToView(request, response, 'createCourse');
};

exports.navigateToStudentTestView = function (request, response) {
    navigateToView(request, response, 'test');
};

