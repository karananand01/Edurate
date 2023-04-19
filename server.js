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
    hash: String,
    University: String,
    Major: String
});
var Student = mongoose.model('Student', StudentSchema);

var ProfessorSchema = new mongoose.Schema({
    username: String,
    password: String,
    salt: String,
    hash: String,
    courses: [String],
    university: String,
    image: String
});
var Professor = mongoose.model('Professor', ProfessorSchema);

var CourseSchema = new mongoose.Schema({
    name: String,
    overview: String,
    professor: String,
    //reviews: [Review]
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

/**
 * LOL
 */
app.get('/student/account/create/:username/:password', (req, res) => {
    let p1 = Student.find({username: req.params.username}).exec();
    p1.then( (results) => { 
      if (results.length > 0) {
        res.end('That username is already taken.');
      } else {
  
        let newSalt = Math.floor((Math.random() * 1000000));
        let toHash = req.params.password + newSalt;
        var hash = crypto.createHash('sha3-256');
        let data = hash.update(toHash, 'utf-8');
        let newHash = data.digest('hex');
  
        var newUser = new Student({ 
          username: req.params.username,
          salt: newSalt,
          hash: newHash
        });
        newUser.save().then( (doc) => { 
            res.end('Created new account!');
          }).catch( (err) => { 
            console.log(err);
            res.end('Failed to create new account.');
          });
      }
    });
    p1.catch( (error) => {
      res.end('Failed to create new account.');
    });
  });
  
  /**
   * Process a Student login request.
   */  
app.get('/student/account/login/:username/:password', (req, res) => {
    let u = req.params.username;
    let p = req.params.password;
    let p1 = Student.find({username:u}).exec();
    p1.then( (results) => { 
      if (results.length == 1) {
  
        let existingSalt = results[0].salt;
        let toHash = req.params.password + existingSalt;
        var hash = crypto.createHash('sha3-256');
        let data = hash.update(toHash, 'utf-8');
        let newHash = data.digest('hex');
        
        console.log("existingSalt:", existingSalt);
        console.log("toHash:", toHash);
        console.log("newHash:", newHash);
        console.log("results[0].hash:", results[0].hash);

        if (newHash == results[0].hash) {
          let id = cm.sessions.addOrUpdateSession(u);
          res.cookie("login", {username: u, sid: id}, {maxAge: 60000*60*24});
          res.end('SUCCESS');
        } else {
          res.end('password was incorrect');
        }
      } else {
        res.end('login failed');
      }
    });
    p1.catch( (error) => {
      res.end('login failed');
    });
  });
  
/**
 * LOL2
 */
app.get('/prof/account/create/:username/:password', (req, res) => {
    let p1 = Professor.find({username: req.params.username}).exec();
    p1.then( (results) => { 
      if (results.length > 0) {
        res.end('That username is already taken.');
      } else {
  
        let newSalt = Math.floor((Math.random() * 1000000));
        let toHash = req.params.password + newSalt;
        var hash = crypto.createHash('sha3-256');
        let data = hash.update(toHash, 'utf-8');
        let newHash = data.digest('hex');
  
        var newUser = new Professor({ 
          username: req.params.username,
          salt: newSalt,
          hash: newHash
        });
        newUser.save().then( (doc) => { 
            res.end('Created new account!');
          }).catch( (err) => { 
            console.log(err);
            res.end('Failed to create new account.');
          });
      }
    });
    p1.catch( (error) => {
      res.end('Failed to create new account.');
    });
  });
  
  /**
   * Process a Prof login request.
   */
  app.get('/prof/account/login/:username/:password', (req, res) => {
    let u = req.params.username;
    let p = req.params.password;
    let p1 = Professor.find({username:u}).exec();
    p1.then( (results) => { 
      if (results.length == 1) {
  
        let existingSalt = results[0].salt;
        let toHash = req.params.password + existingSalt;
        var hash = crypto.createHash('sha3-256');
        let data = hash.update(toHash, 'utf-8');
        let newHash = data.digest('hex');
        
        if (newHash == results[0].hash) {
          let id = cm.sessions.addOrUpdateSession(u);
          res.cookie("login", {username: u, sid: id}, {maxAge: 60000*60*24});
          res.end('SUCCESS');
        } else {
          res.end('password was incorrect');
        }
      } else {
        res.end('login failed');
      }
    });
    p1.catch( (error) => {
      res.end('login failed');
    });
  });

// Start up the server to listen on port 80
const port = 80;
app.listen(port, () => { console.log('server has started'); });