const path = require('path');
const securityController = require('../controllers/securityController');
const mongoose = require('mongoose');

require('../models/MCT');
const MCT = mongoose.model('mct');
require('../models/Result');
const Result = mongoose.model('result');

exports.createTest = function (request, response) {
    securityController.isSessionUserAdmin(request, response, function () {
        MCT.find({}, function (err, test) {
            if (err || test) {
                response.sendStatus(500);
            } else {
                const form = request.body;
                let publishedFrom = new Date(form.publishedFrom);
                let publishedUntil = new Date(form.publishedFrom);
                publishedFrom.setMinutes(0);
                publishedFrom.setHours(0);
                publishedFrom.setSeconds(0);
                publishedUntil.setMinutes(23), publishedUntil.setHours(59);
                publishedUntil.setSeconds(59);
                const mtc = new MCT({
                    testname: form.testname,
                    course_id: form.course_id,
                    publishedFrom: publishedFrom,
                    publishedUntil: publishedUntil,
                    tests: form.tests,
                });
                mtc.save();
                response.sendStatus(201);
            }
        });
    });
};

exports.updateTest = function (request, response) {
    securityController.isSessionUserAdmin(request, response, function () {
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
    securityController.isSessionUserAdmin(request, response, function () {
        MCT.remove({_id: request.body._id}, function (err) {
            if (err)
                response.sendStatus(500);
            response.sendStatus(200);
        });
    });
};

exports.getTestsForCourseAdmin = function (request, response) {
    securityController.isSessionUserAdmin(request, response, function () {
        const course_id = request.query["course_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        MCT.find({course_id: course_id}, function (err, tests) {
            if (err)
                response.sendStatus(500);
            response.send(tests)
        });
    });
};

exports.getTestsForCourseStudent = function (request, response) {
    securityController.isSessionUser(request, response, function () {
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
    securityController.isSessionUserAdmin(request, response, function () {
        const test_id = request.query["test_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        Result.find({test_id: test_id}, function (err, results) {
            if (err)
                response.sendStatus(500);
            response.send(results);
        });
    });
};

exports.getResultsForStudent = function (request, response) {
    securityController.isSessionUser(request, response, function () {
        const course_id = request.query["course_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        const test_id = request.query["test_id"].replace(new RegExp(new RegExp("\""), 'g'), "");
        const student = request.query["student"].replace(new RegExp(new RegExp("\""), 'g'), "");
        Result.find({course_id: course_id, test_id: test_id, student: student}, function (err, results) {
            response.send(results);
        });
    });
};


exports.saveStudentTestResult = function (request, response) {
    securityController.isSessionUser(request, response, function () {
        const course_id = request.body.course_id;
        const test_id = request.body.test_id;
        const username = request.session.username;
        const answers = request.body;
        Result.find({
            course_id: course_id,
            test_id: test_id,
            student: username
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