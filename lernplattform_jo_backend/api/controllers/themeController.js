const securityController = require("../controllers/securityController")
const mongoose = require('mongoose');

require('../models/Theme');
const Theme = mongoose.model('theme');
require('../models/Course');
const Course = mongoose.model('course');

exports.createTheme = function (request, response) {
    securityController.isSessionUserAdmin(request, response, function () {
        const course_id = request.body.course_id;
        const themename = request.body.themename;
        Theme.findOne({course_id: course_id, themename: themename}, function (err, theme) {
            if(err)
                response.sendStatus(500);
            if (!theme) {
                var theme = new Theme({
                    course_id: course_id,
                    themename: themename
                });
                theme.save();
                response.sendStatus(201);
            } else {
                console.log("Das Thema " + themename + " existiert bereits für den Kurs " + course_id);
                response.sendStatus(500);
            }
        })
    });
};

exports.deleteTheme = function (request, response) {
    securityController.isSessionUserAdmin(request, response, function () {
        Theme.remove({_id: request.body._id}, function (err) {
            if (err)
                response.send(500);
            response.send(200)
        });
    });
};

exports.updateTheme = function (request, response) {
    securityController.isSessionUserAdmin(request, response, function () {
        Theme.findOneAndUpdate({
                _id: request.body._id
            }, { themename : request.body.themename}
            , function (err) {
                if (err)
                    response.sendStatus(500);
                response.sendStatus(200);
            });
    });
};


exports.getThemesForCourseAdmin = function (request, response) {
    securityController.isSessionUserAdmin(request, response, function () {
        const course_id = request.query["course_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        Theme.find({course_id: course_id}, function (err, themes) {
            if (err) return console.error(err);
            response.send(themes);
        })
    });
};

exports.getThemesForCourseStudent = function (request, response) {
    securityController.isSessionUser(request, response, function () {
        const course_id = request.query["course_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        const student_id = "Hans"//request.session.username;
        Course.findOne({_id : course_id}, function (err, course) {
            if(err || (!course))
                response.sendStatus(500)
            if(!course.students.includes(student_id)){
                console.log("Student gehört nicht zum Kurs")
                response.send(500)
            }else{
                Theme.find({course_id : course_id},function (err, themes) {
                    if(err)
                        response.sendStatus(500);
                    response.send(themes)
                })
            }
        });
    });
};