module.exports = function (app) {

    const courseController = require('../controllers/courseController');
    const testController = require("../controllers/testController");
    app.route('/course/').post(courseController.createCourse);
    app.route('/course/update/').post(courseController.updateCourse);
    app.route('/course/delete/').post(courseController.deleteCourse);
    app.route('/courses/').get(courseController.getAdminCourses);
    app.route('/course/update/students/').post(courseController.updateStudents);
    app.route('/course/admin/students/remove/').post(courseController.removeStudentsFromCourse);
    app.route('/course/admin/students/').get(courseController.getStudentsFromCourse);
    app.route('/courses/student/').get(courseController.getCoursesForStudent);
    app.route('/course/:coursename').get(courseController.getCourse);
    app.route('/course/:coursename/test').get(testController.getCreateTestView);
    app.route('/course/:coursename/test/:test_id').get(testController.getTestView);

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
    app.route('/user/get/').get(userController.getLoggedInUser);
    app.route('/login/').get(userController.getLoginView);
    app.route('/').get(userController.getLoginView);
    app.route('/index/').get(userController.getOverview);

    const fileController = require('../controllers/fileController');
    app.route('/file/delete/').get(fileController.deleteFile);
    app.route('/file/upload/').post(fileController.uploadFile);
    app.route('/file/download/').get(fileController.downloadFile);
    app.route('/files/student/').get(fileController.getFilesForThemeStudent);




    app.route('/test/').post(testController.createTest);
    app.route('/test/update/').post(testController.updateTest);
    app.route('/test/delete/').post(testController.deleteTest);
    app.route('/tests/admin/').get(testController.getTestsForCourseAdmin);
    app.route('/tests/student/').get(testController.getTestsForCourseStudent);
    app.route('/test/result/').post(testController.saveStudentTestResult);
    app.route('/test/result/admin/').get(testController.getResultsForAdmin);
    app.route('/test/result/student/').get(testController.getResultsForStudent);

};