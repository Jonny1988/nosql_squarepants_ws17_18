const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResultSchema = new Schema({
    testname: String,
    coursename: String,
    student : String,
    points : Number,
    results: Array
});

mongoose.model('result', ResultSchema);