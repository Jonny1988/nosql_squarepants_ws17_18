$(document).ready(function () {

    $('#coursename').change(function (e) {
        var val = $(e.target).val();
        $changeMethodBody(val);
    });

    $.get('http://localhost:3000/view/choice', function (data) {
        $('#choice').replaceWith(data);
    });

    $.get('http://localhost:3000/courses', function (data) {
        var options = "";
        var length = data.length ? data.length : 0
        if (length == 0) {
            $("#createThemeForm").css("display", "none");
        }
        if (data.length > 0) {
            for (var element in data) {
                var coursename = data[element].coursename;
                options += "<option name value=" + coursename + ">" + coursename + "</option>";
            }
        }
        $("#coursename").html(options);
        //get alle themes, files and mtc and add them to the view
        var coursename = data[0] ? data[0].coursename : "";
        $changeMethodBody(coursename)
    });

});
