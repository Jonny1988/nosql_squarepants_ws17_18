const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThemeSchema = new Schema({
    themename: String,
    coursename: String
});


mongoose.model('theme', ThemeSchema);