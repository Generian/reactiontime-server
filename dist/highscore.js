require('dotenv').config();
const mongoose = require('mongoose');
const url = process.env.MONGODB_URI;
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
    .then(result => {
    console.log('connected to MongoDB');
})
    .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
});
const highscoreSchema = new mongoose.Schema({
    time: Number,
    date: Number,
    name: String,
});
highscoreSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});
console.log('connecting to', url);
module.exports = mongoose.model('Highscore', highscoreSchema);
//# sourceMappingURL=highscore.js.map