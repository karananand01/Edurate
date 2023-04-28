/*
    Function that takes all cookies and a name and
    returns the appropriate value for the cookie
    if it exists.
    Both cookie and name are Strings
*/
function getCookieName(cookie, name) {
    let cookies = cookie.split(";");
    for (i in cookies) {
        let keyVal = cookies[i].split("=");
        if (keyVal[0].trim() == name) {
            let val = keyVal[1].split("%22");
            val[3] = val[3].replace("%20", " ");
            return String(val[3]);
        }
    }
}

/*
    Function that takes all cookies and returns the
    username of the user accessing the application
    by finding the value of the "login" cookie
    cookie is a String
*/
function getUser(cookie) {
    let cookies = cookie.split(";");
    for (i in cookies) {
        let keyVal = cookies[i].split("=");
        if (keyVal[0].trim() == "login") {
            let val = keyVal[1].split("%22");
            val[3] = val[3].replace("%20", " ");
            return String(val[3]);
        }
    }
    return false;
}

/*
    Function that takes all cookies and determines if the
    user is a professor or a student. The function does this
    by looking at the login cookie and checking the "type" 
    attribute.
    cookie is a String
*/
function isProf(cookie) {
    let cookies = cookie.split(";");
    for (j in cookies) {
        let keyVal = cookies[j].split("=");
        if (keyVal[0].trim() == "login") {
            let val = keyVal[1].split("%22");
            return (val[9] == "prof");
        }
    }
}

/*
    Function that retrieves information about a professor
    using the name stored in the prof cookie and uses this information
    to populate the home page of the professor.
*/
function getProfPage() {
    let prof = getCookieName(document.cookie, "prof");
    $.get(
        '/prof/page/details/' + prof, (rs, status) => {
            if (rs != 'FAIL') {
                data = JSON.parse(rs);
                fillInfo(data);
            }
        }
    );
}

/*
    Function that retrieves information about a course
    using the name stored in the course cookie and uses this information
    to populate the home page of the course.
*/
function getCoursePage() {
    let crs = getCookieName(document.cookie, "course");
    $.get(
        '/course/page/details/' + crs, (rs, status) => {
            if (rs != 'FAIL') {
                data = JSON.parse(rs);
                fillCourseInfo(data);
            }
        }
    );
}

/*
    Function to get student information to customize search page
*/
function getStudent() {
    let stud = getUser(document.cookie);
    $.get(
        '/student/details/' + stud, (rs, status) => {
            if (rs != 'FAIL') {
                data = JSON.parse(rs);
                fillStudentInfo(data);
            }
        }
    );
}

/*
    Function that uses information retrieved from the database to fill 
    the homepage with customized welcome messages and student information
*/
function fillStudentInfo(data) {
    let head = document.getElementById('welc_text');
    head.innerText = "Welcome " + data.name + " !";
    let univ = document.getElementById('stud_info');
    univ.innerText = data.univ;
}

/*
    Function that uses information retreived from the database
    about a course and uses it to populate the homepage of the
    course. The home page contains some common elements visible
    to all users, but also has some elements that are different based
    on whether the user is a student or a professor.
    data is an object containing retreived course data.
*/
function fillCourseInfo(data) {
    let crsHead = $("#crs_nm");
    let crsText = $("#crs_txt");
    let crsProf = document.getElementById("crs_prof");
    crsHead.text(data.name);
    crsText.text(data.overview);
    data.prof = data.prof.replace(" ", "&nbsp");
    let lnk = "<a href='javascript:;' onclick=getProf('";
    lnk += data.prof + "')>" + data.prof + "</a><br>";
    crsProf.innerHTML = lnk;
    getReviews(data.rvws);
    if (isProf(document.cookie)) {
        let rem = document.getElementById("add_rv");
        let txt = "<h2>Edit Course Information<h2><br><br>";
        txt += '<textarea id="orv_edit" rows="3" cols="150"></textarea>';
        txt += '<button type="button" onclick="editCourse()">Edit Overview</button>'
        rem.innerHTML = txt;
    }
}

/*
    Function to edit course overview. It retrieves
    the new overview text from text area and sends the
    information to the server to be changed.
*/
function editCourse() {
    let newOr = $("#orv_edit").val();
    let crs = getCookieName(document.cookie, "course");
    $.get('/course/edit/overview/' + crs + '/' + newOr, (data, status) => {
        alert(data);
        if (data == "Success") {
            getCoursePage();
        }
    });
}

/*
    Function that uses information retreived from the database
    about a professor and uses it to populate the homepage of the
    professor. The home page contains some common elements visible
    to all users, but also has some elements that are different based
    on whether the user is a student or a professor.
    data is an object containing retreived professor data.
*/
function fillInfo(data) {
    let abtHead = $("#abt_hd");
    let abtBody = $("#abt_txt");
    let cs = document.getElementById("crs_lst");
    let im = document.getElementById("profPic");
    im.innerHTML = showImage(data.image)
    abtHead.text('Professor ' + data.name + " : " + data.univ);
    abtBody.text(data.about);
    cls = "";
    for (i in data.courses) {
        data.courses[i] = data.courses[i].replace(" ", "&nbsp");
        cls += '<a href="javascript:;" onclick=getCourse("';
        cls += data.courses[i] + '")>' + data.courses[i] + '</a><br>';
    }
    cs.innerHTML = cls;
    if (!isProf(document.cookie)) {
        let rem = document.getElementById("edit_prof");
        rem.remove();
    }
}

/*
    function to display an image through its link on
    html and also mentions alternative text for the
    image.
    Input: filename is the name of the image
*/
function showImage(filename) {
    retString = "<img src=\"";
    retString += "./images/" + filename;
    retString += "\" alt=\"" + filename + "\" class = \"pics\">"
    return retString;
}


/*
    Function to edit professors about section. It retrieves
    the new about text from text area and sends the
    information to the server to be changed.
*/
function changeAbt() {
    let newAb = $("#abt_edit").val();
    let prof = getCookieName(document.cookie, "prof");
    $.get('/prof/edit/about/' + prof + '/' + newAb, (data, status) => {
        alert(data);
        if (data == "Success") {
            getProfPage();
        }
    });
}

/*
    Function to redirect the user to the course whose name
    is provided as an argument.
    name is the String containing the course name.
*/
function getCourse(name) {
    name = name.replace("&nbsp", " ");
    $.get(
        '/course/page/' + name, (rs, status) => {
            if (rs = 'Success') {
                window.location.href = '/app/course_page.html';
            }
        }
    );
}

/*
    Function to redirect the user to the home page of the 
    professor whose name is provided as an argument.
    name is the String containing the professor's name.
*/
function getProf(name) {
    name = name.replace("&nbsp", " ");
    $.get('/prof/cookie/' + name, () => {
        window.location.href = '/app/prof_page.html';
    });
}

/*
    Function to add a new course to the database and to update
    the list of courses under the professor creating the 
    course.
*/
function addCourse() {
    let n = $("#crs_add").val();
    let prof = getCookieName(document.cookie, "prof");
    $.get('/course/create/' + n + '/' + prof, (data, status) => {
        alert(data);
        if (data == "Success") {
            getProfPage();
        }

    });
}

/*
    Function to add a new review to the database and to update
    the list of reviews under a course. Reviews are visible to
    all users.
*/
function addRvw() {
    let n = $("#new_rvw").val();
    let r = $("#shift").val();
    let crs = getCookieName(document.cookie, "course");
    $.get('/review/create/' + crs + '/' + n + '/' + r + '/' + getUser(document.cookie) + '/' + "pub"
        , (data, status) => {
            alert(data);
            if (data == "Success") {
                getCoursePage();
            }

        });
}

/*
    Function to add a new Direct message to the database and to update
    the list of reviews under a course. Direct Messages are only visible to
    the professor of the class.
*/
function addDM() {
    let n = $("#new_rvw").val();
    let r = $("#shift").val();
    let crs = getCookieName(document.cookie, "course");
    $.get('/review/create/' + crs + '/' + n + '/' + r + '/' + getUser(document.cookie) + '/' + "priv"
        , (data, status) => {
            alert(data);
            if (data == "Success") {
                getCoursePage();
            }

        });
}

/*
    Function to retrieve course information from the course IDs that
    are stored in the course. The function retreives reviews and
    direct messages and then appends them to the inner HTML of the
    course home page.
    ids is a list of IDs of the reviews stored in the course.
*/
function getReviews(ids) {
    retText = "";
    for (i in ids) {
        let p1 = $.get('/review/retrieve/' + ids[i], (data, status) => {
            rv = JSON.parse(data);
            if (rv.visibility != "priv") {
                retText += "<div class='rv'>" + "Posted by : " + rv.poster + "<br><br>";
                retText += "Rating : " + rv.rating + "<br><br>Review :" + rv.review + "</div>";
            } else if (isProf(document.cookie)) {
                retText += "<div class='rv'> Direct Message <br><br>";
                retText += rv.review + "<br><br>";
                retText += "<button type='button'" + ' onclick=deleteDM("';
                retText += rv._id + '")>Delete Message</button></div>';
                console.log(rv);
            }

        });
        p1.then(() => {
            if (i == ids.length - 1) {
                let crsRevs = document.getElementById("rv_in");
                crsRevs.innerHTML = retText;
            }
        });
    }
}

/*
    Function that takes review ID and deletes it from MongoDB database
    id is a string
*/
function deleteDM(id) {
    let crs = getCookieName(document.cookie, "course");
    $.get('/review/delete/' + id + '/' + crs, (data, status) => {
        if (data == "Success") {
            alert("Direct Message Deleted");
            getCoursePage();
        }
    });
}

/*
    Function to update the output text next to the slider
    representing the rating a poster intended to give
    a course. 
*/
function updateRange() {
    let slider = document.getElementById('csrange');
    let rangeVal = document.getElementById('shift');
    rangeVal.innerHTML = Number(slider.value) + Number(1);
}

/*
    Function to search for all courses whose overview contains
    the text entered by a user. The retrieved courses are displayed
    to the user along with a button directing them to enter the
    home page of the course
*/
function crsSrch() {
    let srch = $("#crs_desc").val();
    let retText = "";
    let p1 = $.get('/course/search/' + srch, (data, status) => {
        rs = JSON.parse(data)
        for (i in rs) {
            rs[i].name = rs[i].name.replace(" ", "&nbsp");
            retText += "<div class='rv'> Course Name: " + rs[i].name + "<br><br>";
            retText += "Course Overview: " + rs[i].overview + "<br><br>";
            retText += "<button type='button'" + ' onclick=getCourse("';
            retText += rs[i].name + '")>Click here to visit course page';
            retText += "</button></div>";
        }
    });
    p1.then(() => {
        let crsRes = document.getElementById("srch_res");
        crsRes.innerHTML = retText;
    })
}

/*
    Function to search for all professors whose name contains
    the text entered by a user. The retrieved professors are displayed
    to the user along with a button directing them to enter the
    home page of the professor.
*/
function profSrch() {
    let srch = $("#prf_name").val();
    let retText = "";
    let p1 = $.get('/prof/search/' + srch, (data, status) => {
        rs = JSON.parse(data)
        for (i in rs) {
            rs[i].name = rs[i].name.replace(" ", "&nbsp");
            retText += "<div class='rv'> Professor Name: " + rs[i].name + "<br><br>";
            retText += "About Professor: " + rs[i].about + "<br><br>";
            retText += "<button type='button'" + ' onclick=getProf("';
            retText += rs[i].name + '")>Click here to visit home page';
            retText += "</button></div>";
        }
    });
    p1.then(() => {
        let crsRes = document.getElementById("srch_res");
        crsRes.innerHTML = retText;
    })
}

/*
    Function returns a user to their home page.
    A professor is returned to their professor page and
    a student is returned to the search page.
*/
function homePage() {
    if (isProf(document.cookie)) {
        getProf(getCookieName(document.cookie, "prof"));
    } else {
        window.location.href = '/app/search_page.html';
    }
}

/*
    Function to redirect the user to the help page.
*/
function help() {
    window.location.href = '/app/help_page.html';
}

/*
    Function to log a user out of their account, end
    their session and redirect them to the index page
    to login/create a new account.
*/
function logout() {
    $.get("/logout", () => {
        document.cookie = "";
        window.location.href = '/account/index.html';
    });

}

/*
    Function to add a new image to the database of the professor and to update
    The image is uploaded as the profile picture of the professor.
*/
function addImage() {
    let im = document.getElementById('img').value.split("\\").slice(-1)[0];
    let prof = getCookieName(document.cookie, "prof");
    $.get('/prof/edit/img/' + prof + '/' + im, (data, status) => {
        alert(data);
        if (data == "Success") {
            getProfPage();
        }
    });
}