const databaseConnection = require('../dbconnection/mariasql');
const viewController = require('../controllers/viewController');
const mongoose = require('mongoose');

require('../models/Course');
const Course = mongoose.model('course');

require('../models/CourseStudents');
const CourseStudents = mongoose.model('courseStudents');
require('../models/MCT');
const MCT = mongoose.model('mct');
require('../models/Result');
const Result = mongoose.model('result');
require('../models/Theme');
const Theme = mongoose.model('theme');

exports.getCourseStudents = function (request, response) {
    if (request.session && request.session.username) { //if this theme already exists for this user??
        const con = databaseConnection.getConnection();
        const sql = "Select * from users where username = \'" + request.session.username + "\';";
        con.query(sql, function (err, result, fields) {
            //if user is admin
            if (result[0].role == 0x15) {
                const coursename = "" + request.query["coursename"].replace(new RegExp(new RegExp("\""), 'g'), "");
                CourseStudents.find({"coursename": coursename}, function (err, students) {
                    response.send(students);
                });
            } else {
                viewController.loginView(request, response);
            }
        });
    } else {
        viewController.loginView(request, response);
    }
};

exports.createCourse = function (request, response) {
    if (request.session && request.session.username) { //if this theme already exists for this user??
        const con = databaseConnection.getConnection();
        const sql = "Select * from users where username = \'" + request.session.username + "\';";
        con.query(sql, function (err, result, fields) {
            //if user is admin
            if (result[0].role == 0x15) {
                // make course name unqique....
                Course.findOne({'coursename': request.body.coursename}, function (err, data) {
                    if (!data) {
                        const course = new Course({
                            owner: request.session.username,
                            description: request.body.description,
                            coursename: request.body.coursename
                        });
                        course.save();
                        viewController.getOverview(request, response);
                    } else {
                        viewController.loginView(request, response);
                    }
                });
            }
        });
    } else {
        viewController.loginView(request, response);
    }
};

exports.getAllCourses = function (request, response) {
    Course.find({owner: request.session.username}, function (err, courses) {
        if (err) return console.error(err);
        if (courses.length > 0) {
            response.send(courses);
        } else {
            getStudentCourses(request, response);
        }
    })
};

getStudentCourses = function (request, response) {
    CourseStudents.find({student: request.session.username}, function (err, courseStudents) {
        if (err) return console.error(err);
        var courses = [];
        for (var pos in courseStudents) {
            Course.find({coursename: courseStudents[pos].coursename}, function (err, course) {
                courses.push(course);
            });
        }
        response.send(courseStudents);
    })
};

exports.addStudents = function (request, response) {
    if (request.session && request.session.username) { //if this theme already exists for this user??
        const con = databaseConnection.getConnection();
        const sql = "Select * from users where username = \'" + request.session.username + "\';";
        con.query(sql, function (err, result, fields) {
            //if user is admin
            if (result[0].role == 0x15) {
                var coursename;
                for (var element in request.body) {
                    if (element == "coursename") {
                        coursename = request.body[element];
                    } else {
                        const student = request.body[element];
                        const courseStudents = new CourseStudents({
                            student: student,
                            coursename: coursename
                        });
                        courseStudents.save();
                    }
                }
                response.redirect("http://localhost:3000/view/overview");
            }
        });
    } else {
        viewController.loginView(request, response);
    }
};

exports.deleteCourse = function (request, response) {
    if (request.session && request.session.username) { //if this theme already exists for this user??
        const con = databaseConnection.getConnection();
        const sql = "Select * from users where username = \'" + request.session.username + "\';"
        const coursename = "" + request.query["coursename"].replace(new RegExp(new RegExp("\""), 'g'), "");
        con.query(sql, function (err, result, fields) {
            //if user is admin
            if (result[0].role == 0x15) {
                // delete all courseStudents
                CourseStudents.remove({coursename: coursename}, function (err, data) {
                    Theme.remove({coursename: coursename}, function (err, data) {
                        MCT.remove({coursename: coursename}, function (err, data) {
                            Result.remove({coursename: coursename}, function (err, data) {
                                Course.remove({coursename: coursename}, function (err, data) {
                                    response.redirect("http://localhost:3000/view/overview");
                                });
                            });
                        });
                    });
                });
            }
        });
    } else {
        viewController.loginView(request, response);
    }
};

executeQuery = function (request, response, query) {
    if (request.session && request.session.username) {
        response.send("valid session");
    } else {
        viewController.loginView(request, response);
    }
};


exports.getAvailableStudents = function (request, response) {
    if (request.session && request.session.username) { //if this theme already exists for this user??
        const con = databaseConnection.getConnection();
        const sql = "Select * from users where username = \'" + request.session.username + "\';";
        con.query(sql, function (err, result, fields) {
            //if user is admin
            if (result[0].role == 0x15) {
                const getAllStudents = "Select * from users where role =" + 37 + ";";
                con.query(getAllStudents, function (err, availableStudents, fields) {
                    //remove all students that are already in use by this course
                    const coursename = "" + request.query["coursename"].replace(new RegExp(new RegExp("\""), 'g'), "");
                    CourseStudents.find({"coursename": coursename}, function (err, courseStudents) {
                        const result = [];
                        for (var posAvailable in availableStudents) {
                            var courseContainsStudent = false;
                            for (var posCourse in courseStudents) {
                                if ((courseStudents[posCourse].student == availableStudents[posAvailable].username)) {
                                    courseContainsStudent = true;
                                }
                            }
                            if (!courseContainsStudent) {
                                result.push({username: availableStudents[posAvailable].username});
                            }
                        }
                        response.send(result);
                    });
                });
            } else {
                viewController.loginView(request, response);
            }
        });
    } else {
        viewController.loginView(request, response);
    }
};