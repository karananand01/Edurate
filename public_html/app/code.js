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

function fillInfo(data) {
    let abtHead = $("#abt_hd");
    let abtBody = $("#abt_txt");
    let cs = document.getElementById("crs_lst");
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

function getProf(name) {
    name = name.replace("&nbsp", " ");
    $.get('/prof/cookie/' + name, () => {
        window.location.href = '/app/prof_page.html';
    });
}


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
                retText += rv.review + "</div>";
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

function updateRange() {
    let slider = document.getElementById('csrange');
    let rangeVal = document.getElementById('shift');
    rangeVal.innerHTML = Number(slider.value) + Number(1);
}

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
            retText += rs[i].name + '")>Click here to visit course page';
            retText += "</button></div>";
        }
    });
    p1.then(() => {
        let crsRes = document.getElementById("srch_res");
        crsRes.innerHTML = retText;
    })
}

function homePage() {
    if (isProf(document.cookie)) {
        getProf(getCookieName(document.cookie, "prof"));
    } else {
        window.location.href = '/app/search_page.html';
    }
}

function help() {
    window.location.href = '/app/help_page.html';
}

function logout() {
    $.get("/logout", () => {
        document.cookie = "";
        window.location.href = '/account/index.html';
    });

}