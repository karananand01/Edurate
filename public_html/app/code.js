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
    let lnk = "<a href='javascript:;' onclick=getProf('";
    lnk += "')>" + data.prof + "</a><br>";
    crsProf.innerHTML = lnk;
    getReviews(data.rvws);
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

function getProf() {
    window.location.href = '/app/prof_page.html';
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
    let crs = getCookieName(document.cookie, "course");
    $.get('/review/create/' + n + '/' + crs, (data, status) => {
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
            retText += "<div class='rv'>" + rv.review + "</div>";
        });
        p1.then(() => {
            if (i == ids.length - 1) {
                let crsRevs = document.getElementById("rv_in");
                crsRevs.innerHTML = retText;
            }
        });
    }
}