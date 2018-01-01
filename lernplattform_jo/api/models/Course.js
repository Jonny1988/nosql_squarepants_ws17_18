const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    owner: String,
    description: String,
    coursename: String
});

mongoose.model('course', CourseSchema);