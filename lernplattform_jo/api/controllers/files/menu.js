$(document).ready(function () {
    $.get('http://localhost:3000/view/menu', function (data) {
        $('#menu').replaceWith(data);

    });
    // $('#username').html($.session.get('username'));
});
