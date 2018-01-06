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

exports.removeStudentsFromCourse = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        const removeStudents = request.body.students;
        const _id = request.body._id;
        Course.findOne({_id: _id}, function (err, course) {
            if (err || !course) response.sendStatus(500);
            const courseStudents = course.students.filter(item => !removeStudents.includes(item));
            Course.findOneAndUpdate({_id: _id},
                {students: courseStudents}, function (err) {
                    if (err)
                        response.sendStatus(500);
                    response.sendStatus(201);
                });
        });
    });
};

exports.getAdminCourses = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function (user) {
        Course.find({owner: user.username},
            function (err, courses) {
                if (err || !courses)
                    response.sendStatus(500);
                response.send(courses);
            })
    });
};

exports.getStudentsFromCourse = function (request, response) {
    securityService.isSessionUser(request, response, false).then(function () {
        const _id = request.query["_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        Course.findOne({_id: _id}, function (err, course) {
            if (err) {
                response.sendStatus(500);
            } else if (course) {
                response.send(course.students);
            } else {
                response.send("Dieser Kurs existiert nicht");
            }
        });
    });
};

exports.getCoursesForStudent = function (request, response) {
    securityService.isSessionUser(request, response, false).then(function (user) {
        const _id = request.query["_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        Course.find({_id: _id}, function (err, courses) {
            if (err || !courses)
                response.sendStatus(500);
            let studentCourses = [];
            for (let pos in courses) {
                const possibleStudentCourse = courses[pos];
                if (possibleStudentCourse.students.includes(user.username)) {
                    studentCourses.push({_id: possibleStudentCourse._id, coursename: possibleStudentCourse.coursename});
                }
            }
            response.send(studentCourses);
        });
    });
};


exports.getCourse = function (request, response) {
    securityService.getSessionUser(request).then(function (user) {
        Course.findOne({coursename: request.params.coursename}).
        populate({
            path: 'themes',
            populate: { path: 'files' }
        }).
        populate({
            path: 'tests',
            populate: { path: 'questions'}
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