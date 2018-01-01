const path = require('path');
const databaseConnection = require('../dbconnection/mariasql');
const viewController = require('../controllers/viewController');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');


require('../models/File');
const File = mongoose.model('file');

exports.getFile = function (request, response) {
    if (request.session && request.session.username) {
        const pos = request.path.split("/").length;
        var filename = request.path.split("/")[pos - 1];
        filename = filename.replace(new RegExp(new RegExp(" "), 'g'), "");
        const con = databaseConnection.getConnection();
        const sql = "Select * from users where username = \'" + request.session.username + "\';";
        con.query(sql, function (err, result, fields) {
            //if user is admin
            if (result[0].role == 0x15) {
                response.sendFile(path.join(__dirname + '/files/' + filename));
            } else {
                File.find({filename: filename}, function (err, file) {
                    if (file && file.publishedFrom <= Date.now() && file.publishedUntil >= Date.now()) {
                        response.sendFile(path.join(__dirname + '/files/' + filename));
                    }else{
                        response.sendFile(path.join(__dirname + '/files/' + filename));
                    }
                });
            }
        });
    }
};
exports.getFilesByTheme = function (request, response) {
    if (request.session && request.session.username) {

        const con = databaseConnection.getConnection();
        const sql = "Select * from users where username = \'" + request.session.username + "\';";
        con.query(sql, function (err, result, fields) {
            //if user is admin
            const coursename = "" + request.query["coursename"].replace(new RegExp(new RegExp("\""), 'g'), "");
            const themename = "" + request.query["themename"].replace(new RegExp(new RegExp("\""), 'g'), "");
            File.find({coursename: coursename, themename: themename}, function (err, files) {
                if ((result[0].role == 0x15) ) {
                    response.send(files);
                } else{
                    var studentFiles = [];
                    for(var file in files){
                        if(files[file].publishedFrom <= Date.now() && files[file].publishedUntil >= Date.now()){
                            studentFiles.push(files[file]);
                        }
                    }
                    response.send(studentFiles);
                }
            });
        });
    }
};

exports.uploadFile = function (request, response) {
    if(!request.files){
        response.send("Keine Datei ausgewählt");
    }else {
        if (request.session && request.session.username) { //if this theme already exists for this user??
            const con = databaseConnection.getConnection();
            const sql = "Select * from users where username = \'" + request.session.username + "\';";
            con.query(sql, function (err, result, fields) {
                //if user is admin
                if (result[0].role == 0x15) {
                    const pth = path.join(__dirname + "/files/");
                    var filename = request.body.coursename + "-" + request.body.themename + "-" + request.files.file.name;
                    filename = filename.replace(new RegExp(new RegExp(" "), 'g'), "");
                    var publishedFrom = new Date(request.body.publishedFrom);
                    var publishedUntil = new Date(request.body.publishedFrom);
                    publishedFrom.setMinutes(0);publishedFrom.setHours(0);publishedFrom.setSeconds(0);
                    publishedUntil.setMinutes(23),publishedUntil.setHours(59);publishedUntil.setSeconds(59);
                    const file = new File({
                        coursename: request.body.coursename,
                        themename: request.body.themename,
                        filename: filename,
                        publishedFrom: publishedFrom,
                        publishedUntil: publishedUntil
                    });
                    const sampleFile = request.files.file;

                    // Use the mv() method to place the file somewhere on your server
                    sampleFile.mv(path.join(__dirname + "/files/" + filename), function (err) {
                        if (err)
                            console.log(err);
                        file.save();
                        response.redirect("http://localhost:3000/view/overview");
                    });
                } else {
                    viewController.loginView(request, response);
                }
            });
        } else {
            viewController.loginView(request, response);
        }
    }
};