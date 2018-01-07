const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MCTSchema = new Schema({
    testname: String,
    publishedFrom: Date,
    publishedUntil: Date,
    questions: [{type: Schema.Types.ObjectId, ref: 'question'}],
    results: [{type: Schema.Types.ObjectId, ref: 'result'}]
}, { usePushEach: true });

const QuestionSchema = new Schema({
    question: String,
    answers: [{ answer: String, points: Number }]
});


mongoose.model('question', QuestionSchema);
mongoose.model('mct', MCTSchema);