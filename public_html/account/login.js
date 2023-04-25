/*
    function to facilitate login
    as student or prof based on
    checkbox value
*/
function login() {
    let isProf = $('#professor');
    if (isProf.prop("checked")) {
        loginprof();
    } else {
        loginstudent();
    }
}

/*
    function to facilitate create account
    as student or prof based on
    checkbox value
*/
function createAccount(){
    let isProf = $('#professor');
    if (isProf.prop("checked")) {
        createAccountprof();
    } else {
        createAccountstudent();
    }
}

/*
    function to facilitate login
    for student, and redirecting to
    search_page
*/
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

/*
    function to facilitate create an account
    for student
*/
function createAccountstudent() {
    let u = $('#username').val();
    let p = $('#pass').val();
    $.get(
        '/student/account/create/' + u + '/' + encodeURIComponent(p),
        (data, status) => {
            alert(data);
        });
}

/*
    function to facilitate login
    for prof, and redirecting to
    professor home page
*/
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

/*
    function to facilitate create an account
    for professor
*/
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

