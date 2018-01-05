const securityService = require('../services/securityService');
const path = require("path");


navigateToView = function (request, response, viewname) {
    securityService.getSessionUser(request).then(function (user) {
        if (user.isAdmin)
            response.sendFile(path.join(__dirname + '/views/admin/' + viewname + '.html'));
        else
            response.sendFile(path.join(__dirname + '/views/student/' + viewname + '.html'));
    }).catch(function(err) {
        console.log(err);
        response.sendStatus(403);
    });
};

exports.getLoginView = function (request, response) {
    response.render('login');
};

exports.getOverview = function (request, response) {
    securityService.getSessionUser(request).then(function (user) {
        if (user.isAdmin)
            response.render('admin/index.ejs', user);
        else
            response.render('student/index.ejs', user);
    }).catch(function(err) {
        console.log(err);
        response.sendStatus(403);
    });
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
exports.getCourse = function (request, response) {
    navigateToView(request, response, 'course/'+request.params.coursename );
};