module.exports = function (app) {
    var themeController = require('../controllers/themeController');

    app.route('/theme/create').post(themeController.createTheme);
    app.route('/themes').get(themeController.getThemesForCourse);
};