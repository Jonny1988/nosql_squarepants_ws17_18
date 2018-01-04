const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    owner: String,
    description: String,
    coursename: String,
    students : Array
});

mongoose.model('course', CourseSchema);