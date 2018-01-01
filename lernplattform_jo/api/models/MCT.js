const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MCTSchema = new Schema({
    testname: String,
    coursename: String,
    publishedFrom : Date,
    publishedUntil : Date,
    test: Array,
});

mongoose.model('mct', MCTSchema);