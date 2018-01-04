const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MCTSchema = new Schema({
    testname: String,
    course_id: Schema.Types.ObjectId,
    publishedFrom : Date,
    publishedUntil : Date,
    tests: Array,
});

mongoose.model('mct', MCTSchema);