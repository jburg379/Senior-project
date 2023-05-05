
"use strict";

// wait until the page is loaded
window.onload = initializePage;


function initializePage() {
    document.getElementById("search").addEventListener("submit", searchListener);
    document.getElementById("add").addEventListener("submit", addListener);
    buildInitialTable();
}


function searchListener(e) {

    e.preventDefault();

    let inp = document.getElementsByTagName("input");
    let value = inp[0].value;

    let url = `/api/customer/${value}`;
    let req = new XMLHttpRequest();

    req.addEventListener("load", e => {
        if(req.status === 200){
            buildTable(JSON.parse(req.responseText));
        }
        else {
            console.log(req.responseText)
        }
    });
    req.open("GET", url);
    req.send();
}


function addListener(e) {

    e.preventDefault();

    let url = "/api/customer";
    let req = new XMLHttpRequest();

    let b_id = document.getElementById("add").business_id.value;
    let f_name = document.getElementById("add").first_name.value;
    let l_name = document.getElementById("add").last_name.value;
    let phon = document.getElementById("add").phone.value;
    let d = document.getElementById("add").day.value;
    let m = document.getElementById("add").month.value;
    let y = document.getElementById("add").year.value;
    let s_time = document.getElementById("add").start_time.value;
    let e_time = document.getElementById("add").end_time.value;

    let start = convertTime(s_time);
    let end = convertTime(e_time);
    
    if(confirm("Are you sure you want to make an appointment for " + m + "/" + d + "/" + y + " from " + start + " to " + end)) {
        if (req.status == 400) {
            alert("You have already made an appointment for this date and time");
        }
        else{
            alert("Your appointment has been scheduled")
        }
    
        req.open("POST", url);
        req.setRequestHeader("Content-type", "application/json");
        let result = {"first_name": f_name, "last_name": l_name, "phone": phon, "day": d, "month": m, "year": y, "start_time": start, "end_time": end, "business_id": b_id};
        req.send(JSON.stringify(result));
    }
}

function buildInitialTable() {
    let req = new XMLHttpRequest();
    req.open('GET', '/api/customer');
    req.addEventListener("load", function() {
        if (req.status == 200) {
            buildTable(JSON.parse(req.responseText));
        }
    });
    req.send();
}


function buildTable(data) {
    var div = document.getElementById("data");
    removeChildren(div);

    console.log(data);

    var table = document.createElement("table");
    var headingRow = document.createElement("tr");

    headingRow.appendChild(document.createElement("th")).appendChild(document.createTextNode("Business id"));
    headingRow.appendChild(document.createElement("th")).appendChild(document.createTextNode("Business Name"));
    headingRow.appendChild(document.createElement("th")).appendChild(document.createTextNode("phone number"));
    headingRow.appendChild(document.createElement("th")).appendChild(document.createTextNode("open hours"));
    headingRow.appendChild(document.createElement("th")).appendChild(document.createTextNode("close hours"));
    headingRow.appendChild(document.createElement("th")).appendChild(document.createTextNode("Street"));
    headingRow.appendChild(document.createElement("th")).appendChild(document.createTextNode("City"));
    headingRow.appendChild(document.createElement("th")).appendChild(document.createTextNode("State"));
    table.appendChild(headingRow);

    for (let d of data) {
        let row = document.createElement("tr");

        let id = document.createElement("td");
        id.appendChild(document.createTextNode(d.business_id));
        row.appendChild(id);

        let name = document.createElement("td");
        name.appendChild(document.createTextNode(d.b_name));
        row.appendChild(name);

        let phone = document.createElement("td");
        phone.appendChild(document.createTextNode(d.phone));
        row.appendChild(phone);

        let op_hours = document.createElement("td");
        op_hours.appendChild(document.createTextNode(d.o_hours));
        row.appendChild(op_hours);

        let cl_hours = document.createElement("td");
        cl_hours.appendChild(document.createTextNode(d.c_hours));
        row.appendChild(cl_hours);

        let stret = document.createElement("td");
        stret.appendChild(document.createTextNode(d.street));
        row.appendChild(stret);

        let cit = document.createElement("td");
        cit.appendChild(document.createTextNode(d.city));
        row.appendChild(cit);

        let state = document.createElement("td");
        state.appendChild(document.createTextNode(d.stte));
        row.appendChild(state);

        table.appendChild(row);
    }
    div.appendChild(table);
}


function removeChildren(node) {
    if (node !== null) {
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }
    }
}

function convertTime(time) {
    //convert time to 24 hour format
    let timeArr = time.split(":");
    let timeHour = timeArr[0];
    let timeMin = timeArr[1];
    let timeFormat = timeHour >= 12 ? "PM" : "AM";
    timeHour = timeHour % 12 || 12;
    time = timeHour + ":" + timeMin + " " + timeFormat;
    return time;
  }