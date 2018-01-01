const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSchema = new Schema({
    coursename: String,
    themename: String,
    filename: String,
    publishedFrom : Date,
    publishedUntil : Date
});

mongoose.model('file', FileSchema);