module.exports = function (app) {
    var courseController = require('../controllers/courseController');

    app.route('/course/create').post(courseController.createCourse);
    app.route('/course/students').post(courseController.addStudents);
    //app.route('/course/').delete(courseController.deleteCourse);
    app.route('/courses/').get(courseController.getAllCourses);
    app.route('/course/').get(courseController.getCourseStudents);
    app.route('/course/').delete(courseController.deleteCourse);
    app.route('/course/availableStudents/').get(courseController.getAvailableStudents);

};