const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThemeSchema = new Schema({
    themename: String,
    files: [{type: Schema.Types.ObjectId, ref: 'file'}],
}, {usePushEach: true});

mongoose.model('theme', ThemeSchema);