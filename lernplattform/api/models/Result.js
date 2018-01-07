const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResultSchema = new Schema({
    student: String,
    points: Number
});

mongoose.model('result', ResultSchema);