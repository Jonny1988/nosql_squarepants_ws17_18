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
}


exports.createTest = function (request, response) {
    securityService.isSessionUser(request, response, true).then(function () {
        Course.findOne({coursename: request.body.coursename}).
        populate({
            path: 'tests'
        }).
        exec().then(function(course) {
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
}

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
        const course_id = request.body.course_id;
        const test_id = request.body.test_id;
        const answers = request.body;
        Result.find({
            course_id: course_id,
            test_id: test_id,
            student: user.username
        }, function (err, result) {
            const res = result;
            MCT.find({course_id: course_id, _id: test_id}, function (err, test) {
                if (res.length == 0) {
                    let studentTestResults = generateResult(answers, test);
                    let result = new Result({
                        course_id: course_id,
                        test_id: test_id,
                        student: username,
                        results: studentTestResults.results,
                        points: studentTestResults.points
                    });
                    result.save();
                    response.sendStatus(201);
                } else {
                    response.sendStatus(200);
                }
            });
        });
    });
};

function generateResult(answers , test){
    let results = { results : null , points : 0 };
    //TODO fixme
    return results;
}