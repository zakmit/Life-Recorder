const mongoose = require('mongoose');
const uri = "";// your database
const db = mongoose.connect(uri, {useNewUrlParser: true});

const entrySchema = mongoose.Schema({
    user: String, /* uid */
    title: String,
    startTime: Date,
    endTime: Date,
    elapse: Number,
    isPomodoro: Boolean,
    pattern: Array
});

module.exports = mongoose.model('Entry', entrySchema);
