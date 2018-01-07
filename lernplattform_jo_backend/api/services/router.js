module.exports = function (app) {

    const courseController = require('../controllers/courseController');
    const testController = require("../controllers/testController");
    const fileController = require('../controllers/fileController');
    const userController = require('../controllers/userController');
    const themeController = require('../controllers/themeController');

    app.route('/').get(userController.getLoginView);
    app.route('/user/logout/').get(userController.logout);
    app.route('/user/register').post(userController.createUser);
    app.route('/user/login/').post(userController.login);

    app.route('/index/').get(userController.getOverview);

    app.route('/course/').post(courseController.createCourse);
    app.route('/course/update/').post(courseController.updateCourse);
    app.route('/course/update/students/').post(courseController.updateStudents);
    app.route('/course/delete/').post(courseController.deleteCourse);

    app.route('/course/:coursename').get(courseController.getCourseView);
    app.route('/course/:coursename/test').get(testController.getCreateTestView);
    app.route('/course/:coursename/test/:test_id').get(testController.getTestView);

    app.route('/theme/').post(themeController.createTheme);
    app.route('/theme/update/').post(themeController.updateTheme);
    app.route('/theme/delete/').post(themeController.deleteTheme);



    app.route('/students/').get(userController.getAllStudents);
    app.route('/user/get/').get(userController.getLoggedInUser);
    app.route('/login/').get(userController.getLoginView);


    app.route('/file/delete/').get(fileController.deleteFile);
    app.route('/file/upload/').post(fileController.uploadFile);
    app.route('/file/download/').get(fileController.downloadFile);
    app.route('/files/student/').get(fileController.getFilesForThemeStudent);




    app.route('/test/').post(testController.createTest);
    app.route('/test/result/').post(testController.saveStudentTestResult);

};