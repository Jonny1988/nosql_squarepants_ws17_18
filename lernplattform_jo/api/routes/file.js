module.exports = function (app) {
    var fileController = require('../controllers/fileController');

    app.route('/files/*').get(fileController.getFile);
    app.route('/files/').get(fileController.getFilesByTheme);
    app.route('/files/uploadFile/').post(fileController.uploadFile);
};