const securityService = require("../services/securityService")
const mongoose = require('mongoose');

require('../models/Theme');
const Theme = mongoose.model('theme');
require('../models/Course');
const Course = mongoose.model('course');

exports.createTheme = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        Course.findOne({coursename: request.body.coursename}).
        populate({
            path: 'themes'
        }).
        exec().then(function(course) {
            var foundSameName = false;
            for(var i= 0; i < course.themes.length; i++) {
                if (course.themes[i].themename == request.body.themename) {
                    foundSameName = true;
                    break
                }
            }
            if (foundSameName)
                return response.send("Es gibt bereits ein Thema mit diesem Namen");

            var theme = new Theme({
                themename: request.body.themename
            });
            theme.save();
            course.themes.push(theme);
            course.save(function (err) {
                if (err) return response.sendStatus(500);
                response.redirect("/course/"+request.body.coursename);
            });

        }).catch(function () {
           return response.sendStatus(500);
        });
    })
};

exports.deleteTheme = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        Theme.remove({_id: request.body._id}, function (err) {
            if (err)
                response.send(500);
            response.send(200)
        });
    })
};

exports.updateTheme = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        Theme.findOneAndUpdate({
                _id: request.body._id
            }, { themename : request.body.themename}
            , function (err) {
                if (err)
                    response.sendStatus(500);
                response.sendStatus(200);
            });
    })
};


exports.getThemesForCourseAdmin = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        const course_id = request.query["course_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        Theme.find({course_id: course_id}, function (err, themes) {
            if (err) return console.error(err);
            response.send(themes);
        })
    });
};

exports.getThemesForCourseStudent = function (request, response) {
    securityService.isSessionUser(request, response, false).then(function (user) {
        const course_id = request.query["course_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        const student_id = "Hans";
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