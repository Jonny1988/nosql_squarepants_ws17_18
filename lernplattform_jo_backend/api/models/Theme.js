const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThemeSchema = new Schema({
    themename: String,
    course_id: Schema.Types.ObjectId
});


mongoose.model('theme', ThemeSchema);