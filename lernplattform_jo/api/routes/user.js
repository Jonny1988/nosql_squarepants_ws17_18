module.exports = function (app) {
    var userController = require('../controllers/userController')

    app.route('/user/register').post(userController.createUser);
    app.route('/user/').get(userController.getUser);
    //app.route('/user/:userId').put(userController.updateUser);
    app.route('/user/login/').post(userController.login);
    app.route('/logout/').get(userController.logout);

};