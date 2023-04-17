const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const crypto = require('crypto');
const cm = require('./customsessions');

cm.sessions.startCleanup();

const connection_string = 'mongodb://127.0.0.1/edurate';

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