const path = require('path');
const securityService = require('../services/securityService');
const mongoose = require('mongoose');
require('../models/Theme');
const Theme = mongoose.model('theme');

var fileDir = path.dirname(require.main.filename)+ '/files/';

function getFilePath(file) {
    return path.join(fileDir + file._id + "_" + file.filename);
}


require('../models/File');
const File = mongoose.model('file');

exports.downloadFile = function (request, response) {
    securityService.getSessionUser(request).then(function (user) {
        const id = request.query["id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        File.findOne({_id: id}, function (err, file) {
            if (err || !file)
                return response.sendStatus(500);
            if (user.isAdmin)
                return response.sendFile(getFilePath(file));
            if (file.publishedFrom <= Date.now() && file.publishedUntil >= Date.now()) {
                return response.sendFile(getFilePath(file));
            } else {
                return response.sendStatus(500)
            }
        });
    });
};

exports.getFilesForThemeStudent = function (request, response) {
    securityService.isSessionUser(request, response, false).then(function () {
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
    securityService.isSessionUser(request, response, true).then(function () {
        if (!request.files || !request.files.file)
            return response.send("Keine Datei ausgewählt");
        Theme.findOne({themename: request.body.themename}, function (err, theme) {
            if (err || !theme) return response.sendStatus(500);
            var filename = request.files.file.name;
            filename = filename.replace(new RegExp(new RegExp(" "), 'g'), "");
            var publishedFrom = new Date(request.body.publishedFrom);
            var publishedUntil = new Date(request.body.publishedFrom);
            publishedFrom.setMinutes(0);
            publishedFrom.setHours(0);
            publishedFrom.setSeconds(0);
            publishedUntil.setMinutes(23);
            publishedUntil.setHours(59);
            publishedUntil.setSeconds(59);
            const file = new File({
                filename: filename,
                publishedFrom: publishedFrom,
                publishedUntil: publishedUntil
            });
            const sampleFile = request.files.file;
            file.save();
            theme.files.push(file);
            theme.save(function (err) {
                if (err) return response.sendStatus(500);
                sampleFile.mv(getFilePath(file), function (err) {
                    if (err) return response.sendStatus(500);
                    response.redirect("/course/" + request.body.coursename);
                });
            });
        });
    });
};

exports.deleteFile = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        //TODO fixme
    });
};