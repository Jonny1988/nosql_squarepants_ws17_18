module.exports = function (app) {
    var viewController = require('../controllers/viewController');

    //route to views
    app.route('/login/').get(viewController.loginView);
    app.route('/index/').get(viewController.loginView);
    app.route('/').get(viewController.loginView);
    app.route('/view/overview/').get(viewController.getOverview);
    app.route('/view/createCourse/').get(viewController.createCourseView);
    app.route('/view/editParticipant/').get(viewController.editParticipant);
    app.route('/view/results/').get(viewController.results);
    app.route('/view/menu/').get(viewController.menu);
    app.route('/view/choice/').get(viewController.choice);
    app.route('/view/createTest/').get(viewController.createTest);
    app.route('/view/upload/').get(viewController.upload);
    app.route('/view/createTheme/').get(viewController.createTheme);

};