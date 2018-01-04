const securityService = require('../services/securityService');
const path = require("path");


navigateToView = function (request, response, viewname) {
    securityService.getSessionUser(request).then(function (isAdmin) {
        if (isAdmin)
            response.sendFile(path.join(__dirname + '/views/admin/' + viewname + '.html'));
        else
            response.sendFile(path.join(__dirname + '/views/student/' + viewname + '.html'));
    }).catch(function(err) {
        console.log(err);
        response.sendStatus(403);
    });
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

