function loginstudent() {
    let u = $('#username').val();
    let p = $('#pass').val();
    $.get(
        '/student/account/login/' + u + '/' + encodeURIComponent(p),
        (data, status) => {
            alert(data);
            if (data == 'SUCCESS') {
                window.location.href = '/app/search_page.html';
            }
        });
}

function createAccountstudent() {
    let u = $('#usernameStu').val();
    let p = $('#passStu').val();
    $.get(
        '/student/account/create/' + u + '/' + encodeURIComponent(p),
        (data, status) => {
            alert(data);
        });
}

function loginprof() {
    let u = $('#username').val();
    let p = $('#pass').val();
    $.get(
        '/prof/account/login/' + u + '/' + encodeURIComponent(p),
        (data, status) => {
            alert(data);
            if (data == 'SUCCESS') {
                window.location.href = '/app/prof_page.html';
            }
        });
}

function getProfPage(prof_name) {
    $.get(
        '/prof/page/' + prof_name, (rs, status) => {
            if (rs != 'FAIL') {
                data = JSON.parse(rs);
                window.location.href = data.ad;
                fillInfo(prof_name, data);
            }
        }
    );
}

function fillInfo(name, dt) {
    let abtHead = document.getElementById("abt_hd");
}

function createAccountprof() {
    let u = $('#username').val();
    let p = $('#pass').val();
    let uni = $('#uni').val();
    let nm = $('#nam').val();
    $.get(
        '/prof/account/create/' + u + '/' + encodeURIComponent(p) + '/' + uni + '/' + nm,
        (data, status) => {
            alert(data);
        });
}