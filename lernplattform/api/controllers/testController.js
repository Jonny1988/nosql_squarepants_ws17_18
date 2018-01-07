require('../models/MCT');
require('../models/Result');
require('../models/Course');
const securityService = require('../services/securityService');
const utilService = require('../services/utilService');
const mongoose = require('mongoose');

const MCT = mongoose.model('mct');
const Question = mongoose.model('question');
const Result = mongoose.model('result');
const Course = mongoose.model('course');

exports.getCreateTestView = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function (user) {
        Course.findOne({coursename: request.params.coursename})
            .exec().then(function (course) {
            response.render('admin/createTest', {user: user, course: course});
        }).catch(function () {
            return response.sendStatus(500);
        });
    });
};

function getTestViewForStudent(user, course, test, response) {
    // hole den wenn bekannten alten result
    let result;
    for (let i = 0; i < test.results.length; i++) {
        if (test.results[i].student == user.username) {
            result = test.results[i];
            break;
        }
    }
    // Kein Result gefunden ? dann schreib den test
    if (!result) {
        // darf nur noch schreiben wenn nicht abgelaufen
        if (utilService.isDateInRange(test))
            return response.render('student/test', {user: user, course: course, test: test});
        return response.status(423).send("Zeitpunkt abgelaufen um diesen Test zu schreiben");

    }
    // ansonten zeige den Resultat an
    return response.render('student/result', {user: user, course: course, test: test, result: result});
}

exports.getTestView = function (request, response) {
    securityService.isSessionUser(request, response, false).then(function (user) {
        Course.findOne({coursename: request.params.coursename, tests: request.params.test_id})
            .populate({
                path: 'tests',
                populate: {path: 'questions'}
            })
            .populate({
                path: 'tests',
                populate: {path: 'results'}
            })
            .exec().then(function (course) {
            if (!course)
                return response.status(405).send("Kann Kurs nicht finden");
            // hole den spezifischen Test
            let test = null;
            for (let i = 0; i < course.tests.length; i++) {
                if (course.tests[i]._id == request.params.test_id) {
                    test = course.tests[i];
                    break;
                }
            }
            if (user.isAdmin)
                return response.render('admin/result', {user: user, course: course, test: test});
            getTestViewForStudent(user, course, test, response);
        }).catch(function () {
            return response.sendStatus(500);
        });
    });
};


exports.createTest = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        Course.findOne({coursename: request.body.coursename})
            .populate('tests')
            .exec().then(function (course) {
            const range = utilService.cleanRange(request.body);
            const mct = new MCT({
                testname: request.body.testname,
                publishedFrom: range.publishedFrom,
                publishedUntil: range.publishedUntil
            });
            console.log(request.body);
            request.body.questions.forEach(function (question) {
                const quest = new Question(question);
                quest.save();
                mct.questions.push(quest);
            });

            mct.save(function (err) {
                if (err) {
                    console.log(err);
                    return response.sendStatus(500);
                }
                course.tests.push(mct);
                course.save(function (err) {
                    if (err) {
                        console.log(err);
                        return response.sendStatus(500);
                    }
                    response.redirect("/course/" + request.body.coursename);
                });
            });
        }).catch(function (err) {
            console.log(err);
            return response.sendStatus(500);
        });
    });
};

exports.saveStudentTestResult = function (request, response) {
    securityService.isSessionUser(request, response, false).then(function (user) {
        MCT.findOne({_id: request.body.test_id})
            .populate('results')
            .populate('questions')
            .exec().then(function (mct) {
            // alten Result suchen
            let result;
            for (let i = 0; i < mct.results.length; i++) {
                if (mct.results[i].student == user.username) {
                    result = mct.results[i];
                    break;
                }
            }
            // darf nicht nochmal....
            if (result)
                return response.status(403).send("Es ist nicht möglich einen Test nochmals abzuschließen");
            result = new Result({
                student: user.username
            });
            result.points = calculatePoints(mct, request.body.question);
            result.save();
            mct.results.push(result);
            mct.save(function (err) {
                if (err) return response.sendStatus(500);
                response.redirect("/course/" + request.body.coursename + "/test/" + mct._id);
            });
        }).catch(function () {
            return response.sendStatus(500);
        });
    });
};

function calculatePoints(mct, answers) {
    let points = 0;
    for (let questionId = 0; questionId < mct.questions.length; questionId++) {
        points += mct.questions[questionId].answers[answers[questionId].answer].points;
    }
    return points;
}