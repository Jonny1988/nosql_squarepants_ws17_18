module.exports = function (app) {
    var mtcController = require("../controllers/mctController");

    app.route('/test/create/').post(mtcController.createTest);
    app.route('/test/').get(mtcController.getMCTs);
    app.route('/test/student/').get(mtcController.getStudentMCTs);
    app.route('/test/course/').get(mtcController.getTest);
    app.route('/test/course/result/').post(mtcController.saveResult);
    app.route('/test/course/result/').get(mtcController.getResults);
};