require('../models/Theme');
require('../models/File');
const securityService = require('../services/securityService');
const path = require('path');
const mongoose = require('mongoose');
const Theme = mongoose.model('theme');
const File = mongoose.model('file');

const fileDir = path.dirname(require.main.filename) + '/files/';

function getFilePath(file) {
    return path.join(fileDir + file._id + "_" + file.filename);
}

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

exports.uploadFile = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        if (!request.files || !request.files.file)
            return response.send("Keine Datei ausgewählt");
        Theme.findOne({themename: request.body.themename}, function (err, theme) {
            if (err || !theme) return response.sendStatus(500);
            let filename = request.files.file.name;
            filename = filename.replace(new RegExp(new RegExp(" "), 'g'), "");
            let publishedFrom = new Date(request.body.publishedFrom);
            let publishedUntil = new Date(request.body.publishedFrom);
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