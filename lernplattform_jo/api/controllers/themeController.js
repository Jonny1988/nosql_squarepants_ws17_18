const databaseConnection = require('../dbconnection/mariasql');
const viewController = require('../controllers/viewController');
const mongoose = require('mongoose');

require('../models/Theme');
const Theme = mongoose.model('theme');

exports.createTheme = function (request, response) {
    if (request.session && request.session.username) { //if this theme already exists for this user??
        const con = databaseConnection.getConnection();
        const sql = "Select * from users where username = \'" + request.session.username + "\';";
        con.query(sql, function (err, result, fields) {
            //if user is admin
            if (result[0].role == 0x15) {
                var theme = new Theme({
                    coursename: request.body.coursename,
                    themename: request.body.themename
                });
                theme.save();
                response.redirect("http://localhost:3000/view/overview");
            } else {
                viewController.loginView(request, response);
            }
        });
    } else {
        viewController.loginView(request, response);
    }
};

exports.getThemesForCourse = function (request, response) {
    const con = databaseConnection.getConnection();
    const sql = "Select * from users where username = \'" + request.session.username + "\';";
    con.query(sql, function (err, result, fields) {
        //if user is admin

        const coursename = "" + request.query["coursename"].replace(new RegExp(new RegExp("\""), 'g'), "");
        Theme.find({coursename: coursename}, function (err, themes) {
            if (err) return console.error(err);
            response.send(themes);
        })
    });

};

function trim(str) {
    return str.replace("\"", "")
}