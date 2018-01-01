const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseStudentsSchema = new Schema({
    coursename: String,
    student: String
});

mongoose.model('courseStudents', CourseStudentsSchema);