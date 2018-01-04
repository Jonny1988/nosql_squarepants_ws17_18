const path = require('path');
const securityController = require('../services/securityService');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');


require('../models/File');
const File = mongoose.model('file');
const ObjectId = require('mongodb').ObjectId;

exports.downloadFileAdmin = function (request, response) {
    securityController.isSessionUserAdmin(request, response, function () {
        const _id = request.query["_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        response.sendFile(path.join(__dirname + '/files/' + _id));
    });
};

exports.downloadFileStudent = function (request, response) {
    securityController.getSessionUser(request, response, function () {
        const _id = request.query["_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        File.find({_id: _id}, function (err, file) {
            if (err)
                response.sendStatus(500);
            if (file && file.publishedFrom <= Date.now() && file.publishedUntil >= Date.now()) {
                response.sendFile(path.join(__dirname + '/files/' + _id));
            } else {
                console.log("Der Zugriff auf diese Datei ist nicht möglich");
                response.sendStatus(500)
            }
        });
    });
};

exports.getFilesForThemeAdmin = function (request, response) {
    securityController.isSessionUserAdmin(request, response, function () {
        const course_id = request.query["course_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        const theme_id = request.query["theme_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        File.find({course_id: course_id, theme_id: theme_id}, function (err, files) {
            if (err)
                response.sendStatus(500);
            response.send(files);
        });
    });
};

exports.getFilesForThemeStudent = function (request, response) {
    securityController.getSessionUser(request, response, function () {
        const course_id = request.query["course_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        const theme_id = request.query["theme_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        File.find({course_id: course_id, theme_id: theme_id}, function (err, files) {
            if (err)
                response.sendStatus(500);
            var studentFiles = [];
            for (var pos in files) {
                var file = files[pos];
                if (file && file.publishedFrom <= Date.now() && file.publishedUntil >= Date.now()) {
                    studentFiles.push(file);
                }
            }
            response.send(studentFiles);
        });
    });
};

exports.uploadFile = function (request, response) {
    securityController.isSessionUserAdmin(request, response, function () {
        if (!request.files) {
            response.send("Keine Datei ausgewählt");
        } else {
            var filename = request.files.file.name;
            filename = filename.replace(new RegExp(new RegExp(" "), 'g'), "");
            var publishedFrom = new Date(request.body.publishedFrom);
            var publishedUntil = new Date(request.body.publishedFrom);
            publishedFrom.setMinutes(0);
            publishedFrom.setHours(0);
            publishedFrom.setSeconds(0);
            publishedUntil.setMinutes(23), publishedUntil.setHours(59);
            publishedUntil.setSeconds(59);
            const file = new File({
                course_id: request.body.course_id,
                theme_id: request.body.theme_id,
                filename: filename,
                publishedFrom: publishedFrom,
                publishedUntil: publishedUntil
            });
            const sampleFile = request.files.file;

            file.save();
            sampleFile.mv(path.join(__dirname + "/files/" + file._id), function (err) {
                if (err)
                    response.sendStatus(500);
                response.sendStatus(201);
            });
        }
    });
};

exports.deleteFile = function (request, response) {
    securityController.isSessionUserAdmin(request, response, function () {
        //TODO fixme
    });
};