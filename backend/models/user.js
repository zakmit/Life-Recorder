const mongoose = require('mongoose');
const uri = "";// your database
const db = mongoose.connect(uri, {useNewUrlParser: true});

const userSchema = mongoose.Schema({
    user: String, /* uid */
    databaseID: Number,
    themeName: String,
    pomoMinutes: Number,
    showHours: Boolean
});

module.exports = mongoose.model('User', userSchema);
