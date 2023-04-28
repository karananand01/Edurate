const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const crypto = require('crypto');
const cm = require('./customsessions');

const multer = require('multer');
//Specifying directory to save images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + '/public_html/app/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

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

/*
    Post request for Uploading an image to be saved in server
*/
app.post('/upload', upload.single('photo'), (req, res, next) => {
    res.redirect('/app/prof_page.html');
});

var StudentSchema = new mongoose.Schema({
    username: String,
    password: String,
    salt: String,
    hash: String,
    university: String,
    name: String,
    Major: String
});
var Student = mongoose.model('Student', StudentSchema);

var ProfessorSchema = new mongoose.Schema({
    username: String,
    password: String,
    salt: String,
    hash: String,
    name: String,
    about: String,
    courses: [String],
    university: String,
    image: String
});
var Professor = mongoose.model('Professor', ProfessorSchema);

var CourseSchema = new mongoose.Schema({
    name: String,
    overview: String,
    professor: String,
    reviews: [String]
});
var Course = mongoose.model('Course', CourseSchema);

var ReviewSchema = new mongoose.Schema({
    poster: String,
    major: String,
    rating: String,
    review: String,
    visibility: String
});
var Review = mongoose.model('Review', ReviewSchema);

/*
    End users session
*/
app.get('/logout', (req, res) => {
    let c = req.cookies;
    if (c && c.login) {
        cm.sessions.deleteSession(c.login.username, c);
    }
    res.end();

});

/**
 * Create new student account
 */
app.get('/student/account/create/:username/:password/:uni/:nm', (req, res) => {
    let p1 = Student.find({ username: req.params.username }).exec();
    p1.then((results) => {
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
                university: req.params.uni,
                name: req.params.nm,
                salt: newSalt,
                hash: newHash
            });
            newUser.save().then((doc) => {
                res.end('Created new account!');
            }).catch((err) => {
                console.log(err);
                res.end('Failed to create new account.');
            });
        }
    });
    p1.catch((error) => {
        res.end('Failed to create new account.');
    });
});

/**
 * Process a Student login request.
 */
app.get('/student/account/login/:username/:password', (req, res) => {
    let u = req.params.username;
    let p = req.params.password;
    let p1 = Student.find({ username: u }).exec();
    p1.then((results) => {
        if (results.length == 1) {

            let existingSalt = results[0].salt;
            let toHash = req.params.password + existingSalt;
            var hash = crypto.createHash('sha3-256');
            let data = hash.update(toHash, 'utf-8');
            let newHash = data.digest('hex');

            if (newHash == results[0].hash) {
                let id = cm.sessions.addOrUpdateSession(u);
                res.cookie("login", { username: u, sid: id, type: "stud" }, { maxAge: 60000 * 60 * 24 });
                res.end('SUCCESS');
            } else {
                res.end('password was incorrect');
            }
        } else {
            res.end('login failed');
        }
    });
    p1.catch((error) => {
        res.end('login failed');
    });
});

app.get('/student/details/:name', (req, res) => {
    let st = req.params.name;
    let p1 = Student.findOne({ username: st }).exec();
    p1.then((doc) => {
        result = {
            univ: doc.university, name: doc.name,
        };
        res.end(JSON.stringify(result));
    })
    p1.catch((err) => {
        res.end('FAIL');
    });
});

/**
 * Create new professor account
 */
app.get('/prof/account/create/:username/:password/:uni/:nm', (req, res) => {
    let p1 = Professor.find({ username: req.params.username }).exec();
    p1.then((results) => {
        if (results.length > 0) {
            res.end('That username is already taken.');
        } else {
            let p2 = Professor.find({ name: req.params.nm }).exec();
            p2.then((dt) => {
                if (dt.length > 0) {
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
                        hash: newHash,
                        about: "This Section is still Empty",
                        courses: "",
                        university: req.params.uni,
                        name: req.params.nm,
                        image: "default.jpg"
                    });
                    newUser.save().then((doc) => {
                        res.end('Created new account!');
                    }).catch((err) => {
                        console.log(err);
                        res.end('Failed to create new account.');
                    });
                }
            });
            p2.catch((error) => {
                res.end('Failed to create new account.');
            });
        }
    });
    p1.catch((error) => {
        res.end('Failed to create new account.');
    });
});

/**
 * Process a Prof login request.
 */
app.get('/prof/account/login/:username/:password', (req, res) => {
    let u = req.params.username;
    let p = req.params.password;
    let p1 = Professor.find({ username: u }).exec();
    p1.then((results) => {
        if (results.length == 1) {

            let existingSalt = results[0].salt;
            let toHash = req.params.password + existingSalt;
            var hash = crypto.createHash('sha3-256');
            let data = hash.update(toHash, 'utf-8');
            let newHash = data.digest('hex');

            if (newHash == results[0].hash) {
                let id = cm.sessions.addOrUpdateSession(u);
                res.cookie("login", { username: u, sid: id, type: "prof" }, { maxAge: 60000 * 60 * 24 });
                res.cookie("prof", { name: results[0].name });
                res.end('SUCCESS');
            } else {
                res.end('password was incorrect');
            }
        } else {
            res.end('login failed');
        }
    });
    p1.catch((error) => {
        res.end('login failed');
    });
});

/*
    Create new course in database and add the course name
    to the professor's collection
*/
app.get('/course/create/:name/:prof', (req, res) => {
    let n = req.params.name;
    let p = req.params.prof;
    let p1 = Course.find({ name: n }).exec();
    p1.then((results) => {
        if (results.length > 0) {
            res.end("That course already exists");
        } else {
            let newCourse = Course({
                name: n, professor: p,
                overview: "This section is empty"
            });
            newCourse.save().then((doc) => {
                let p2 = Professor.updateOne({ name: p },
                    { $push: { courses: n } }).exec();
                p2.then(() => {
                    res.end("Success");
                });
                p2.catch((err) => {
                    res.end("ERROR");
                });
            }).catch((err) => {
                res.end("ERROR");
            });
        }
    });
    p1.catch((err) => {
        res.end("ERROR");
    });
});

/*
    Create new review for a course using its rating, review content 
    and visibility. The review id is also stored in the collection 
    for the course.
*/
app.get('/review/create/:crs/:rvw/:rat/:pt/:vis', (req, res) => {
    let c = req.params.crs;
    let t = req.params.rvw;
    let r = req.params.rat;
    let p = req.params.pt;
    let v = req.params.vis;
    let newReview = Review({ review: t, rating: r, poster: p, visibility: v });
    p1 = newReview.save();
    p1.then((doc) => {
        let p2 = Course.updateOne({ name: c }, { $push: { reviews: doc.id } }).exec();
        p2.then(() => {
            res.end("Success");
        });
        p2.catch((err) => {
            res.end("ERROR");
        });
    });
    p1.catch((err) => {
        res.end("ERROR");
    });
});

/*
    Function to retrieve a review from the database from 
    the id of the review
*/
app.get('/review/retrieve/:id', (req, res) => {
    let i = req.params.id;
    p1 = Review.findOne({ _id: i }).exec();
    p1.then((doc) => {
        res.end(JSON.stringify(doc));
    });
    p1.catch((err) => {
        res.end("ERROR");
    });
});

/*
    Function to delete a review from database by ID.
*/
app.get('/review/delete/:id/:crs', (req, res) => {
    let i = req.params.id;
    let c = req.params.crs;
    p1 = Review.deleteOne({ _id: i }).exec();
    p1.then(() => {
        p2 = Course.updateOne({ name: c }, { $pull: { reviews: i } }).exec();
        p2.then(() => {
            res.end("Success");
        });
        p2.catch((err) => {
            res.end("ERROR");
        });
    });
    p1.catch((err) => {
        res.end("ERROR");
    });
});


/*
    Function to change the about section for a professor
*/
app.get('/prof/edit/about/:prf/:abt', (req, res) => {
    let a = req.params.abt;
    let n = req.params.prf;
    let p1 = Professor.updateOne({ name: n }, { about: a }).exec();
    p1.then(() => {
        res.end("Success");
    })
    p1.catch((err) => {
        res.end("ERROR");
    });
});

/*
    Function to change the profile image for a professor
*/
app.get('/prof/edit/img/:prf/:im', (req, res) => {
    let n = req.params.prf;
    let i = req.params.im;

    let p1 = Professor.updateOne({ name: n }, { image: i }).exec();
    p1.then(() => {
        res.end("Success");
    })
    p1.catch((err) => {
        res.end("ERROR");
    });
});

/*
    Function to change the overview section for a course.
*/
app.get('/course/edit/overview/:crs/:abt', (req, res) => {
    let a = req.params.abt;
    let c = req.params.crs;
    let p1 = Course.updateOne({ name: c }, { overview: a }).exec();
    p1.then(() => {
        res.end("Success");
    })
    p1.catch((err) => {
        res.end("ERROR");
    });
});

/*
    Function to create a cookie for a course
*/
app.get('/course/page/:nm', (req, res) => {
    res.cookie('course', { name: req.params.nm });
    res.end("Success");
});

/*
    Function to create a cookie for a professor
*/
app.get('/prof/cookie/:nm', (req, res) => {
    res.cookie('prof', { name: req.params.nm });
    res.end("Success");
});

/*
    Function to search for all courses in the database that have
    overviews matching words entered by the user 
*/
app.get('/course/search/:srch', (req, res) => {
    let srch = req.params.srch;
    let p1 = Course.find({ overview: { "$regex": srch, "$options": "i" } }).exec();
    p1.then((results) => {
        res.end(JSON.stringify(results));
    });
    p1.catch((err) => {
        console.log(err);
        res.end('FAIL');
    });
});

/*
    Function to search for all professors in the database who have
    names matching words entered by the user 
*/
app.get('/prof/search/:srch', (req, res) => {
    let srch = req.params.srch;
    let p1 = Professor.find({ name: { "$regex": srch, "$options": "i" } }).exec();
    p1.then((results) => {
        res.end(JSON.stringify(results));
    });
    p1.catch((err) => {
        console.log(err);
        res.end('FAIL');
    });
});

/*
    Function to retrieve information about a professor from the
    database from the name of the professor.
*/
app.get('/prof/page/details/:nm', (req, res) => {
    let pr = req.params.nm;
    let p1 = Professor.findOne({ name: pr }).exec();
    p1.then((doc) => {
        result = {
            univ: doc.university, about: doc.about,
            courses: doc.courses, name: doc.name,
            image: doc.image
        };
        res.end(JSON.stringify(result));
    })
    p1.catch((err) => {
        res.end('FAIL');
    });
}
);

/*
    Function to retrieve information about a course from the
    database from the name of the course.
*/
app.get('/course/page/details/:nm', (req, res) => {
    let cr = req.params.nm;
    let p1 = Course.findOne({ name: cr }).exec();
    p1.then((doc) => {
        result = {
            name: doc.name, overview: doc.overview,
            prof: doc.professor, rvws: doc.reviews
        };
        res.end(JSON.stringify(result));
    })
    p1.catch((err) => {
        res.end('FAIL');
    });
}
);


// Start up the server to listen on port 80
const port = 80;
app.listen(port, () => { console.log('server has started'); });