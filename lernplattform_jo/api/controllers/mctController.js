const path = require('path');
const databaseConnection = require('../dbconnection/mariasql');
const viewController = require('../controllers/viewController');
const mongoose = require('mongoose');

require('../models/MCT');
const MCT = mongoose.model('mct');
require('../models/CourseStudents');
const CourseStudents = mongoose.model('courseStudents');
require('../models/Result');
const Result = mongoose.model('result');

exports.getResults = function (request, response) {
    if (request.session && request.session.username) {
        const coursename = "" + request.query["coursename"].replace(new RegExp(new RegExp("\""), 'g'), "");
        const username = request.session.username;
        const con = databaseConnection.getConnection();
        const sql = "Select * from users where username = \'" + username + "\';";
        con.query(sql, function (err, result, fields) {
            var html;
            if (result[0].role == 0x15) {
                Result.find({coursename: coursename}, function (err, results) {
                    html = createAdminResultBody(results);
                    response.send(html);
                });
            } else {
                Result.find({coursename: coursename, student: username}, function (err, results) {
                    html = createStudentResult(results);
                    response.send(html);
                });
                // prüfen, ob der Student wirklich dem Kurs zugeordnet ist

            }
        });
    } else {
        viewController.loginView(request, response);
    }
};

exports.createTest = function (request, response) {
    if (request.session && request.session.username) {
        const con = databaseConnection.getConnection();
        const sql = "Select * from users where username = \'" + request.session.username + "\';";
        con.query(sql, function (err, result, fields) {
            //if user is admin
            if (result[0].role == 0x15) {
                const form = request.body;
                //get alle questions and so on from the form.
                var test = getTestContentFromForm(form);
                const mtc = new MCT({
                    testname: form.testname,
                    coursename: form.coursename,
                    publishedFrom: form.publishedFrom,
                    publishedUntil: form.publishedUntil,
                    test: test,
                });
                mtc.save();
                viewController.getOverview(request, response);
            } else {
                response.send("Rechte nicht vorhanden")
            }
        });
    } else {
        viewController.loginView(request, response);
    }
};

exports.getMCTs = function (request, response) {
    if (request.session && request.session.username) {
        const con = databaseConnection.getConnection();
        const sql = "Select * from users where username = \'" + request.session.username + "\';";
        con.query(sql, function (err, result, fields) {
            //if user is admin
            if (result[0].role == 0x15) {
                const courseName = "" + request.query["coursename"].replace(new RegExp(new RegExp("\""), 'g'), "");
                MCT.find({coursename: courseName}, function (err, tests) {
                    if (tests.length > 0) {
                        var html = getTestListHTML(tests);
                        response.send(html)
                    } else {
                        response.send("F&uumlr diesen Kurs sind keine Tests vorhanden");
                    }
                });
            } else {
                viewController.getOverview(request, response);
            }
        });
    } else {
        viewController.loginView(request, response);
    }
};

exports.getStudentMCTs = function (request, response) {
    if (request.session && request.session.username) {
        const coursename = "" + request.query["coursename"].replace(new RegExp(new RegExp("\""), 'g'), "");
        // TODO replace with aggregate $lookup
        CourseStudents.find({
            coursename: coursename,
            student: request.session.username
        }, function (err, courseStudents) {
            if (courseStudents.length > 0) {
                MCT.find({coursename: coursename}, function (err, tests) {
                    if (tests) {
                        var html = getStudentTestListHTML(coursename, tests);
                        response.send(html)
                    } else {
                        response.send("F&uumlr diesen Kurs sind keine Tests vorhanden");
                    }
                });
            } else {
                viewController.getOverview(request, response);
            }
        });
    } else {
        viewController.loginView(request, response);
    }
};

exports.getTest = function (request, response) {
    if (request.session && request.session.username) {
        const coursename = "" + request.query["coursename"].replace(new RegExp(new RegExp("\""), 'g'), "");
        const testname = "" + request.query["testname"].replace(new RegExp(new RegExp("\""), 'g'), "");
        const username = request.session.username;
        // TODO replace with aggregation $lookup
        CourseStudents.find({
            coursename: coursename,
            student: request.session.username
        }, function (err, courseStudents) {
            if (courseStudents.length > 0) {
                MCT.find({coursename: coursename, testname: testname}, function (err, test) {
                    Result.find({coursename: coursename, testname: testname, student: username},
                        function (err, result) {
                            var html;
                            if (result.length > 0) {
                                var message = "Sie haben den Test \"" + testname + " des Kurses \"" + coursename + "\" bereits abgeschlossen";
                                html = generateHTMLWithMessage(coursename, testname, message);
                                response.send(html);
                            } else {
                                html = generateTestHTML(test, coursename, testname);
                                response.send(html);
                            }
                        });
                });
            } else {
                viewController.getOverview(request, response);
            }
        });
    } else {
        viewController.loginView(request, response);
    }
};

exports.saveResult = function (request, response) {
    if (request.session && request.session.username) {
        //if user has finished this course before do nothing
        const coursename = request.body.coursename;
        const testname = request.body.testname;
        const username = request.session.username;
        const answers = request.body;
        //TODO replace with aggregate $lookup
        Result.find({
            coursename: coursename,
            testname: testname,
            student: username
        }, function (err, result) {
            const res = result;
            MCT.find({coursename: coursename, testname: testname}, function (err, test) {
                if (res.length == 0) {
                    var studentTestResults = generateResult(answers, test);
                    var result = new Result({
                        coursename: coursename,
                        testname: testname,
                        student: username,
                        results: studentTestResults[0],
                        points: studentTestResults[1]
                    });
                    result.save();
                    viewController.getOverview(request, response);
                } else {
                    viewController.getOverview(request, response);
                }
            });
        });
    } else {
        viewController.loginView(request, response);
    }
};

function generateResult(answers, test, result) {
    var array = [];
    var results = [];
    var exptectedResults = getCorrectAnswers(test);
    var studentResults = getStudentResults(answers);
    // group0 = "grün"
    // group1 = "blau"
    // group2 = "ergibt keinen Sinn"
    // group3 = "Mustang"
    var points = 0;
    for (var result in studentResults) {
        if (exptectedResults[result].answer == studentResults[result].answer) {
            results.push({question: result, result: studentResults[result].answer})
            points++;
        } else {
            results.push({question: result, result: studentResults[result].answer})
        }
    }
    array[0] = results;
    array[1] = points;
    return array;
}

function getStudentResults(studentAnswers) {
    var results = [];
    for (var element in studentAnswers) {
        if (element.includes("group")) {
            results.push({answer: studentAnswers[element]})
        }
    }
    return results;
}

function getCorrectAnswers(test) {
    var correctAnswers = [];
    var questions = test[0].test;
    for (var results in questions) {
        if (questions[results]['question']) {
            var solution = questions[results].solution;
            correctAnswers.push({answer: questions[results].answers[solution]})
        }
    }
    return correctAnswers;
}

function getTestListHTML(test) {
    var list = "<ul class=\"list-group\">";
    for (var pos in test) {
        var testname = test[pos].testname;
        list += "<li class=\"list-group-item\" id='" + testname + "'>" + testname + "</li>";
    }
    list += "</ul>";
    return list;
}

function getStudentTestListHTML(coursename, test) {
    var list = "<ul class=\"list-group\">";
    for (var pos in test) {
        var testname = test[pos].testname;
        var url = "http://localhost:3000/test/course/?coursename=\"" + coursename + "\"&testname=\"" + testname + "\"";
        list +=
            "<li class=\"list-group-item\" id='" + testname + "'>" +
            "<a href='" + url + "'>" + testname + "</a>" +
            "</li>";
    }
    list += "</ul>";
    return list;
}

function getTestContentFromForm(form) {
    var test = [];
    for (var q = 0; q < 4; q++) {
        var question = "question" + q;
        var answers = []
        for (var a = 0; a < 4; a++) {
            var answer = "answer" + a + "Question" + q;
            answers.push(form[answer]);
        }
        test.push({question: form[question], "answers": answers, solution: form["answerQuestion" + q]});
    }
    return test;
}

function generateTestHTML(test, coursename, testname) {
    var action = "http://localhost:3000/test/course/result/"
    var html =
        "<!DOCTYPE html>" +
        "<html lang=\"en\">" +
        "<head>" +
        "<meta charset=\"UTF-8\">" +
        "<title>&Uumlbersicht Kurse</title>" +
        "<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\">" +
        "<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js\"></script>" +
        "<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\"></script>" +
        "<script src=\"http://localhost:3000/files/menu.js\"></script>" +
        "</head>" +
        "<body>" +
        "<div id=\"menu\"></div>" +
        "<div class='container'>" +
        "<form method='post' action=\"" + action + "\">" +
        "<label for='coursename'> Kurs:" + coursename + "  </label>"
        + "<input type='hidden' id='coursename' name='coursename' " +
        " value=\"" + coursename + "\" readyonly='true'>" +
        "<label for='testname'> Test: " + testname + " </label>"
        + "<input type='hidden' id='testname' name='testname' " +
        " value='" + testname + "' readyonly='true'><br><hr>";
    ;
    for (var questionPosition in test[0].test) {
        if (test[0].test[questionPosition]['question']) {
            var question = test[0].test[questionPosition]['question']
            html += "<p>" + question + "</p>"
            var answers = test[0].test[questionPosition]['answers'];
            var group = "group" + questionPosition;
            html += "<fieldset name='" + group + "'>";
            for (var answerPosition in answers) {
                var answer = answers[answerPosition];
                var answerId = "answer" + answerPosition + "Question" + questionPosition;
                html +=
                    "<div class=\"form-check\" >" +
                    "<input class=\"form-check-input\" type='radio' value='" + answer + "' id='" + answerId + "' name='" + group + "' ";
                if (answerPosition == 0) {
                    html += " checked "
                }
                html += ">" + answer + "<br>" +
                    "</div>";
            }
            html += "</fieldset><hr>";
        }
    }
    html += "<button type='submit'  class='btn btn-primary'>Test abgeben</button>" +
        "</form></div></body></html>";
    return html;
}


function generateHTMLWithMessage(coursename, testname, message) {
    var action = "http://localhost:3000/test/course/result/"
    var html =
        "<!DOCTYPE html>" +
        "<html lang=\"en\">" +
        "<head>" +
        "<meta charset=\"UTF-8\">" +
        "<title>&Uumlbersicht Kurse</title>" +
        "<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\">" +
        "<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js\"></script>" +
        "<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\"></script>" +
        "<script src=\"http://localhost:3000/files/menu.js\"></script>" +
        "</head>" +
        "<body>" +
        "<div id=\"menu\"></div>" +
        "<div class='container'>" +
        "<p>" + message + "</p>"
    "</div></body></html>";
    return html;
}

function createAdminResultBody(result) {
    var html = "<table class='table'>" +
        "<thead>" +
        "<tr>" +
        "<th scope='col'>Student</th>" +
        "<th scope='col'>Test</th>" +
        "<th scope='col'>Punkte</th>" +
        "<th scope='col'>Frage 1</th>" +
        "<th scope='col'>Frage 2</th>" +
        "<th scope='col'>Frage 3</th>" +
        "<th scope='col'>Frage 4</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody>";
    for (var pos in result) {
        var erg = result[pos]._doc;
        var testname = erg["testname"]
        var student = erg["student"];
        var answers = erg.results;
        var points = erg.points;
        html +=
            "<tr>" +
            "<td scope='row'>" + student + "</td>" +
            "<td>" + testname + "</td>" +
            "<td>" + points + "</td>";
        for (var element in answers) {
            if (answers[element].question) {
                var question = answers[element].question;
                var answer = answers[element].result;
                html += "<td>" + answer + "</td>";
            }

        }
        html += "</tr>";
    }
    html += "</tbody></table>"
    return html;
}

function createStudentResult(result) {
    var html = "<table class='table'>" +
        "<thead>" +
        "<tr>" +
        "<th scope='col'>Test</th>" +
        "<th scope='col'>Punkte</th>" +
        "<th scope='col'>Frage 1</th>" +
        "<th scope='col'>Frage 2</th>" +
        "<th scope='col'>Frage 3</th>" +
        "<th scope='col'>Frage 4</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody>";
    for (var pos in result) {
        var erg = result[0]._doc;
        var testname = erg["testname"]
        var answers = erg.results;
        var points = erg.points;
        html +=
            "<tr>" +
            "<td>" + testname + "</td>" +
            "<td>" + points + "</td>";
        for (var element in answers) {
            if (answers[element].question) {
                var question = answers[element].question;
                var answer = answers[element].result;
                html += "<td>" + answer + "</td>";
            }

        }
        html += "</tr>";
    }
    html += "</tbody></table>"
    return html;
}