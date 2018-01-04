const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSchema = new Schema({
    course_id: Schema.Types.ObjectId,
    theme_id: Schema.Types.ObjectId,
    filename: String,
    publishedFrom : Date,
    publishedUntil : Date
});

mongoose.model('file', FileSchema);