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

/*
    Function to redirect User to Help page
*/
function help() {
    window.location.href = '/account/help_page.html';
}

/*
    Function to redirect User to the index page
*/
function homePage() {
    window.location.href = '/account/index.html';
}

