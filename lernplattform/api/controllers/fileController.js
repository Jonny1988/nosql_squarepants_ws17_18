require('../models/Theme');
require('../models/File');
const securityService = require('../services/securityService');
const utilService = require('../services/utilService');
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
        const id = utilService.cleanString(request.query["id"]);
        File.findOne({_id: id}, function (err, file) {
            if (err || !file)
                return response.status(404).send("Angeforderte Datei gibt es nicht");
            const canNotAccessFile = ((!user.isAdmin) && !utilService.isDateInRange(file))
            if (canNotAccessFile)
                return response.status(423).send("Zeitpunkt abgelaufen um dieses Datei anzusehen");
            return response.sendFile(getFilePath(file));
        });
    });
};

exports.uploadFile = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        if (!request.files || !request.files.file)
            return response.status(405).send("Keine Datei ausgewählt");
        Theme.findOne({_id: request.body.theme_id}, function (err, theme) {
            if (err || !theme)
                return response.status(405).send("Kann Thema nicht finden");
            const filename = utilService.cleanString(request.files.file.name);
            const range = utilService.cleanRange(request.body);
            const file = new File({
                filename: filename,
                publishedFrom: range.publishedFrom,
                publishedUntil: range.publishedUntil
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