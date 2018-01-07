const securityService = require('../services/securityService');
const mongoose = require('mongoose');

require('../models/Course');
const Course = mongoose.model('course');
require('../models/MCT');
const MCT = mongoose.model('mct');
require('../models/Result');
const Result = mongoose.model('result');
require('../models/Theme');
const Theme = mongoose.model('theme');


exports.createCourse = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function (user) {
        const coursename = request.body.coursename;
        Course.findOne({coursename: coursename}, function (err, data) {
            if (err)
                response.sendStatus(500);
            if (data) {
                response.send("Der Kurs " + coursename + " existiert bereits!")
            } else {
                var defaultTheme = new Theme({
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
            }
        });
    });
};

exports.deleteCourse = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        const _id = request.body._id;
        Theme.remove({course_id: _id}, function () {

            MCT.remove({course_id: _id}, function () {
                Result.remove({course_id: _id}, function (err) {
                    File.remove({course_id: _id}, function (err) {
                        //TODO delete all files ...
                        Course.remove({_id: _id}, function (err) {
                            if (err)
                                response.sendStatus(500);
                            response.sendStatus(200);
                        });
                    });
                });
            });
        });
    });
};

exports.updateCourse = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        Course.findOneAndUpdate({_id: request.body._id}, {
            description: request.body.description,
            coursename: request.body.coursename
        }, function (err) {
            if (err)
                return response.sendStatus(500);
            response.redirect("/course/"+request.body.coursename);
        });
    });
};

exports.updateStudents = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        Course.findOneAndUpdate({coursename: request.body.coursename},
            {students: request.body.student}, function (err) {
                if (err)
                    return response.sendStatus(500);
                response.redirect("/course/"+request.body.coursename);
            });
    });
};

exports.getCourseView = function (request, response) {
    securityService.getSessionUser(request).then(function (user) {
        Course.findOne({coursename: request.params.coursename}).
        populate({
            path: 'themes',
            populate: { path: 'files' }
        }).
        populate({
            path: 'tests'
        }).
        exec().then(function(course) {
            if (user.isAdmin)
                response.render('admin/course', { user: user, course: course});
            else
                response.render('student/course', { user: user, course: course});
        }).catch(function(err) {
            console.error(err);
            return response.sendStatus(403);
        });
    }).catch(function() {
        response.sendStatus(403);
    });
};