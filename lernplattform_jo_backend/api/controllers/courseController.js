require('../models/Course');
require('../models/MCT');
require('../models/Result');
require('../models/Theme');
const securityService = require('../services/securityService');
const mongoose = require('mongoose');

const Course = mongoose.model('course');
const MCT = mongoose.model('mct');
const Result = mongoose.model('result');
const Theme = mongoose.model('theme');

exports.createCourse = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function (user) {
        const coursename = request.body.coursename;
        Course.findOne({coursename: coursename}, function (err, data) {
            if (err)
                return response.sendStatus(500);
            if (data)
                return response.send("Der Kurs " + coursename + " existiert bereits!")
            let defaultTheme = new Theme({
                _id: new mongoose.Types.ObjectId(),
                themename: 'Default'
            });
            defaultTheme.save();
            const course = new Course({
                owner: user.username,
                description: request.body.description,
                coursename: coursename
            });
            course.themes.push(defaultTheme);

            course.save();
            response.redirect("/index");
        });
    });
};

exports.deleteCourse = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        // TODO soll man das überhaupt dürfen ?
    });
};

exports.updateCourse = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        // TODO was darf man überhaupt ändern ?
    });
};

exports.updateStudents = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        Course.findOneAndUpdate({coursename: request.body.coursename},
            {students: request.body.student}, function (err) {
                if (err)
                    return response.sendStatus(500);
                response.redirect("/course/" + request.body.coursename);
            });
    });
};

exports.getCourseView = function (request, response) {
    securityService.getSessionUser(request).then(function (user) {
        Course.findOne({coursename: request.params.coursename}).populate({
            path: 'themes',
            populate: {path: 'files'}
        }).populate({
            path: 'tests'
        }).exec().then(function (course) {
            if (user.isAdmin)
                return response.render('admin/course', {user: user, course: course});
            response.render('student/course', {user: user, course: course});
        }).catch(function (err) {
            return response.sendStatus(403);
        });
    }).catch(function () {
        response.sendStatus(403);
    });
};