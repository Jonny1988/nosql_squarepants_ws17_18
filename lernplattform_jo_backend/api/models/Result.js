const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResultSchema = new Schema({
    test_id: Schema.Types.ObjectId,
    student : String,
    points : Number,
    results: Array
});

mongoose.model('result', ResultSchema);