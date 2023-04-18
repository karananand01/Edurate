const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const crypto = require('crypto');
const cm = require('./customsessions');

cm.sessions.startCleanup();

const connection_string = 'mongodb://127.0.0.1/edurate';

/**
 * Initialize the express app and configure with various features 
 * such as JSON parsing, static file serving, etc.
 */
const app = express();
app.use(cookieParser());
app.use('/app/*', authenticate);
app.use(express.static('public_html'))
app.use(express.json())

mongoose.connect(connection_string);
mongoose.connection.on('error', () => {
    console.log('There was a problem connecting to mongoDB');
});

function authenticate(req, res, next) {
    let c = req.cookies;
    if (c && c.login) {
        let result = cm.sessions.doesUserHaveSession(c.login.username, c.login.sid);
        if (result) {
            next();
            return;
        }
    }
    res.redirect('/account/index.html');
}

app.use('*', (req, res, next) => {
    let c = req.cookies;
    if (c && c.login) {
        if (cm.sessions.doesUserHaveSession(c.login.username, c.login.sid)) {
            cm.sessions.addOrUpdateSession(c.login.username);
        }
    }
    next();
});

var StudentSchema = new mongoose.Schema({
    username: String,
    password: String,
    salt: String,
    University: String,
    Major: String
});
var Student = mongoose.model('Student', StudentSchema);

var ProfessorSchema = new mongoose.Schema({
    username: String,
    password: String,
    salt: String,
    courses: [String],
    university: String,
    image: String
});
var Professor = mongoose.model('Professor', ProfessorSchema);

var CourseSchema = new mongoose.Schema({
    name: String,
    overview: String,
    professor: String,
    reviews: [Review]
});
var Course = mongoose.model('Course', CourseSchema);

var ReviewSchema = new mongoose.Schema({
    poster: String,
    major: String,
    rating: Number,
    review: String,
    visibility: String
});
var Review = mongoose.model('Review', ReviewSchema);



// Start up the server to listen on port 80
const port = 80;
app.listen(port, () => { console.log('server has started'); });