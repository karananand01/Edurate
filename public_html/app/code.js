function getProfPage() {
    let prof = getProfName(document.cookie);
    $.get(
        '/prof/page/details/' + prof, (rs, status) => {
            if (rs != 'FAIL') {
                data = JSON.parse(rs);
                fillInfo(data);
            }
        }
    );
}

function fillInfo(data) {
    let abtHead = $("#abt_hd");
    let abtBody = $("#abt_txt");
    let cs = document.getElementById("crs_lst");
    abtHead.text('Professor ' + data.name + " : " + data.univ);
    abtBody.text(data.about);
    cls = "";
    for (i in data.courses) {
        cls += "<a href='javascript:;' onclick=getCourse('";
        cls += data.courses[i] + "')>" + data.courses[i] + "</a?";
    }
    cs.innerHTML = cls;
}

function getProfName(cookie) {
    let cookies = cookie.split(";");
    for (i in cookies) {
        let keyVal = cookies[i].split("=");
        if (keyVal[0] == "prof") {
            let val = keyVal[1].split("%22");
            return val[3];
        }
    }
}

function getCourse(name) {

}