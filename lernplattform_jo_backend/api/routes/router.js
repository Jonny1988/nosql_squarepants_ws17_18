const databaseConnection = require('../dbconnection/mariasql');
const viewController = require('../controllers/viewController');
const securityController = require('../controllers/securityController');

module.exports = function (app) {

    const courseController = require('../controllers/courseController');
    app.route('/course/').post(courseController.createCourse);
    app.route('/course/update/').post(courseController.updateCourse);
    app.route('/course/delete/').post(courseController.deleteCourse);
    app.route('/courses/').get(courseController.getAdminCourses);
    app.route('/course/admin/students/').post(courseController.addStudentsToCourse);
    app.route('/course/admin/students/remove/').post(courseController.removeStudentsFromCourse);
    app.route('/course/admin/students/').get(courseController.getStudentsFromCourse);
    app.route('/courses/student/').get(courseController.getCoursesForStudent);

    const themeController = require('../controllers/themeController');
    app.route('/theme/').post(themeController.createTheme);
    app.route('/theme/update/').post(themeController.updateTheme);
    app.route('/theme/delete/').post(themeController.deleteTheme);
    app.route('/themes/admin/').get(themeController.getThemesForCourseAdmin);
    app.route('/themes/student/').get(themeController.getThemesForCourseStudent);


    const userController = require('../controllers/userController')
    app.route('/user/register').post(userController.createUser);
    app.route('/user/login/').post(userController.login);
    app.route('/logout/').get(userController.logout);
    app.route('/students/').get(userController.getAllStudents);

    const viewController = require('../controllers/viewController');
    app.route('/login/').get(viewController.getLoginView);
    app.route('/index/').get(viewController.getLoginView);
    app.route('/').get(viewController.getLoginView);
    app.route('/view/overview/').get(viewController.getOverview);

    const fileController = require('../controllers/fileController');
    app.route('/file/delete/').get(fileController.deleteFile);
    app.route('/file/upload/').post(fileController.uploadFile);
    app.route('/file/admin/download/').post(fileController.downloadFileAdmin);
    app.route('/file/student/download/').post(fileController.downloadFileStudent);
    app.route('/files/admin/').get(fileController.getFilesForThemeAdmin);
    app.route('/files/student/').get(fileController.getFilesForThemeStudent);


    const mtcController = require("../controllers/testController");
    app.route('/test/create/').post(mtcController.createTest);
    app.route('/test/update/').post(mtcController.updateTest);
    app.route('/test/delete/').post(mtcController.deleteTest);
    app.route('/tests/admin/').get(mtcController.getTestsForCourseAdmin);
    app.route('/tests/student/').get(mtcController.getTestsForCourseStudent);
    app.route('/test/result/').post(mtcController.saveStudentTestResult);
    app.route('/test/result/admin/').get(mtcController.getResultsForAdmin);
    app.route('/test/result/student/').get(mtcController.getResultsForStudent);

};