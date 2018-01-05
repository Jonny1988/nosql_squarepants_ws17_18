const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    owner: String,
    description: String,
    coursename: String,
    themes: [{ type: Schema.Types.ObjectId, ref: 'theme' }],
    students : Array
});

mongoose.model('course', CourseSchema);
