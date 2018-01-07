const path = require('path');
const securityService = require('../services/securityService');
const mongoose = require('mongoose');

require('../models/MCT');
const MCT = mongoose.model('mct');
const Question = mongoose.model('question');
require('../models/Result');
const Result = mongoose.model('result');
require('../models/Course');
const Course = mongoose.model('course');

exports.getCreateTestView = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function (user) {
        Course.findOne({coursename: request.params.coursename})
            .exec().then(function (course) {
            response.render('admin/createTest', { user: user, course: course});
        }).catch(function (err) {
            console.log(err);
            return response.sendStatus(500);
        });
    });
};

exports.getTestView = function (request, response) {
    securityService.isSessionUser(request, response, false).then(function (user) {
        Course.findOne({coursename: request.params.coursename, tests: request.params.test_id})
            .populate({
                path: 'tests',
                populate: { path: 'questions'}
            })
            .exec().then(function (course) {
                if (!course)
                    return response.sendStatus(500);
                // hole den spezifischen Test
                let test = null;
                for(let i = 0; i < course.tests.length; i++) {
                    if (course.tests[i]._id == request.params.test_id) {
                        test = course.tests[i];
                        break;
                    }
                }
                response.render('student/test', { user: user, course: course, test: test});
            }).catch(function () {
                return response.sendStatus(500);
            });
    });
};


exports.createTest = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        Course.findOne({coursename: request.body.coursename})
            .populate( 'tests')
            .exec().then(function(course) {
            let publishedFrom = new Date(request.body.publishedFrom);
            let publishedUntil = new Date(request.body.publishedFrom);
            publishedFrom.setMinutes(0);
            publishedFrom.setHours(0);
            publishedFrom.setSeconds(0);
            publishedUntil.setMinutes(23), publishedUntil.setHours(59);
            publishedUntil.setSeconds(59);
            const mct = new MCT({
                testname: request.body.testname,
                publishedFrom: publishedFrom,
                publishedUntil: publishedUntil
            });
            request.body.questions.forEach(function(question) {
                const quest = new Question(question);
                quest.save();
                mct.questions.push(quest);
            });
            mct.save(function (err) {
                if (err) return response.sendStatus(500);
                course.tests.push(mct);
                course.save(function(err) {
                    if (err) return response.sendStatus(500);
                    response.redirect("/course/"+request.body.coursename);
                });
            });

        }).catch(function () {
            return response.sendStatus(500);
        });
    });
};

// TODO update Test sollte nie funktionieren
exports.updateTest = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        const form = request.body;
        let publishedFrom = new Date(form.publishedFrom);
        let publishedUntil = new Date(form.publishedFrom);
        publishedFrom.setMinutes(0);
        publishedFrom.setHours(0);
        publishedFrom.setSeconds(0);
        publishedUntil.setMinutes(23), publishedUntil.setHours(59);
        publishedUntil.setSeconds(59);
        MCT.findOneAndUpdate({_id: form._id}, {
            testname: form.testname,
            publishedFrom: publishedFrom,
            publishedUntil: publishedUntil,
            tests: form.tests,
        }, function (err) {
            if (err)
                response.sendStatus(500);
            response.sendStatus(201);
        });
    });
};

// TODO delete Test ? gleiches problem wie update
exports.deleteTest = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        MCT.remove({_id: request.body._id}, function (err) {
            if (err)
                response.sendStatus(500);
            response.sendStatus(200);
        });
    });
};

exports.getTestsForCourseAdmin = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        const course_id = request.query["course_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        MCT.find({course_id: course_id}, function (err, tests) {
            if (err)
                response.sendStatus(500);
            response.send(tests)
        });
    });
};

exports.getTestsForCourseStudent = function (request, response) {
    securityService.isSessionUser(request, response, false).then(function () {
        const course_id = request.query["course_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        MCT.find({course_id: course_id}, function (err, tests) {
            if (err)
                response.sendStatus(500);
            let studentTests = []
            for (let pos in tests) {
                let test = tests[pos];
                if (test && test.publishedFrom <= Date.now() && test.publishedUntil >= Date.now()) {
                    // TODO fixme was darf der Student alles sehen?
                    studentTests.push({question: test.tests.question, answers: test.tests.answers});
                }
            }
            response.send(studentTests)
        });
    });
};

exports.getResultsForAdmin = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        const test_id = request.query["test_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        Result.find({test_id: test_id}, function (err, results) {
            if (err)
                response.sendStatus(500);
            response.send(results);
        });
    });
};

exports.getResultsForStudent = function (request, response) {
    securityService.isSessionUser(request, response, false).then(function () {
        const course_id = request.query["course_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        const test_id = request.query["test_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        const student = request.query["student"].replace(new RegExp(new RegExp("\""), 'g'), "");
        Result.find({course_id: course_id, test_id: test_id, student: student}, function (err, results) {
            response.send(results);
        });
    });
};


exports.saveStudentTestResult = function (request, response) {
    securityService.isSessionUser(request, response, false).then(function (user) {
        MCT.findOne({_id: request.body.test_id})
            .populate( 'results')
            .populate( 'questions')
            .exec().then(function(mct) {
                // alten Result suchen
                let result;
                for(let i = 0; i < mct.results.length; i++) {
                    if (mct.results[i].student == user.username) {
                        result = mct.results[i];
                        break;
                    }
                }
                // darf nicht nochmal....
                if (result)
                    return response.sendStatus(500);
                result = new Result({
                    student: user.username
                });
                result.points = calculatePoints(mct, request.body.question);
                result.save();
                mct.results.push(result);
                mct.save(function (err) {
                    if (err) return response.sendStatus(500);
                    response.redirect("/course/"+request.body.coursename);
                });
        }).catch(function() {
            return response.sendStatus(500);
        });
    });
};

function calculatePoints(mct, answers) {
    let points = 0;
    console.log("calc POints");
    console.log(mct);
    console.log(answers);
    for(let questionId = 0; questionId < mct.questions.length; questionId ++) {
        console.log("schaue für frage : "+mct.questions[questionId].question);
        console.log("antwort : "+answers[questionId].answer);
        points += mct.questions[questionId].answers[answers[questionId].answer].points;
        console.log("points nun "+ points);
    }
    return points;
}