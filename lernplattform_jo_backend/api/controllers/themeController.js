require('../models/Theme');
require('../models/Course');
const securityService = require("../services/securityService")
const mongoose = require('mongoose');

const Theme = mongoose.model('theme');
const Course = mongoose.model('course');

exports.createTheme = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        Course.findOne({coursename: request.body.coursename}).populate({
            path: 'themes'
        }).exec().then(function (course) {
            let foundSameName = false;
            for (let i = 0; i < course.themes.length; i++) {
                if (course.themes[i].themename == request.body.themename) {
                    foundSameName = true;
                    break
                }
            }
            if (foundSameName)
                return response.send("Es gibt bereits ein Thema mit diesem Namen");

            let theme = new Theme({
                themename: request.body.themename
            });
            theme.save();
            course.themes.push(theme);
            course.save(function (err) {
                if (err) return response.sendStatus(500);
                response.redirect("/course/" + request.body.coursename);
            });

        }).catch(function () {
            return response.sendStatus(500);
        });
    })
};

exports.deleteTheme = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        // TODO
        // Theme.remove({_id: request.body._id}, function (err) {
        //     if (err)
        //         response.send(500);
        //     response.send(200)
        // });
    })
};

exports.updateTheme = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        // TODO
        // Theme.findOneAndUpdate({
        //         _id: request.body._id
        //     }, {themename: request.body.themename}
        //     , function (err) {
        //         if (err)
        //             response.sendStatus(500);
        //         response.sendStatus(200);
        //     });
    })
};