"use strict";

window.addEventListener('load', (event) => {

    //This section gets all the templates on the HTML file
    let Template = document.getElementById("home");
    let phoneTemplate = document.getElementById("phone");
    let hoursTemplate = document.getElementById("hours");
    let addressTemplate = document.getElementById("address");

    //This opens tha page to a home page seperate from all the buttons
    root.appendChild(Template.content.cloneNode(true));

    //Gets all the <button> from the HTML file
    let phoneButton = document.getElementById("phoneButton");
    let hoursButton = document.getElementById("hoursButton");
    let addressButton = document.getElementById("addressButton");


    //This sections adds the functions below to the buttons in order to display a "page" when the buttons are clicked

    //Shows the display page when the display button is clicked
    function phoneListenerFunction() {
        root.querySelectorAll("*").forEach(n => n.remove());
        root.appendChild(phoneTemplate.content.cloneNode(true));
        addEventListener("submit", phoneListener, {once:true});
    }

    //Shows the search page
    function hoursListenerFunction() {
        root.querySelectorAll("*").forEach(n => n.remove());
        root.appendChild(hoursTemplate.content.cloneNode(true));
        addEventListener("submit", hoursListener, {once:true});
    }

    //Shows the Add anime page
    function addressListenerFunction() {
        root.querySelectorAll("*").forEach(n => n.remove());
        root.appendChild(addressTemplate.content.cloneNode(true));
        addEventListener("submit", addressListener, {once:true});
    }

    //Shows the delete anime page
    //function deleteListenerFunction() {
    //    root.querySelectorAll("*").forEach(n => n.remove());
    //    root.appendChild(removeTemplate.content.cloneNode(true));
    //    addEventListener("submit", removeListener, {once:true});
    //}

    //This section adds an event listener to each button so that it may run as told in the commet up top
    phoneButton.addEventListener("click", phoneListenerFunction);
    hoursButton.addEventListener("click", hoursListenerFunction);
    addressButton.addEventListener("click", addressListenerFunction);
    //deleteButton.addEventListener("click", deleteListenerFunction);

})

function phoneListener(e) {

    e.preventDefault();

    let phone = document.getElementById("change phone").b_phone.value;

    let url = `/api/edit_profile/phone`;
    let req = new XMLHttpRequest();

    req.addEventListener("load", e => {
        if (req.status === 200) {
            alert("Your phone number has been changed")
        } else {
            alert(req.responseText)
        }
    });

    req.open("PUT", url);
    req.setRequestHeader("Content-type", "application/json");
    let result = {"phone": phone};
    req.send(JSON.stringify(result));
}


function hoursListener(e) {
    e.preventDefault();

    let open = document.getElementById("change hours").s_hours_open.value;
    let close = document.getElementById("change hours").s_hours_close.value;

    let url = `/api/edit_profile/hours`;
    let req = new XMLHttpRequest();

    req.addEventListener("load", e => {
        if (req.status === 200) {
            alert("Your business hours have been changed")
        } else {
            alert(req.responseText)
        }
    });

    req.open("PUT", url);
    req.setRequestHeader("Content-type", "application/json");
    let result = {"o_hours": open, "c_hours": close};
    req.send(JSON.stringify(result));
    alert("Your business hours have been changed")
}


function addressListener(e) {
    e.preventDefault();

    let street = document.getElementById("change address").street.value;
    let city = document.getElementById("change address").city.value;
    let state = document.getElementById("change address").state.value;
    let zip = document.getElementById("change address").zip_code.value;

    let url = `/api/edit_profile/address`;
    let req = new XMLHttpRequest();

    req.addEventListener("load", e => {
        if (req.status === 200) {
            alert("Your business address have been changed")
        } else {
            alert(req.responseText)
        }
    });

    req.open("PUT", url);
    req.setRequestHeader("Content-type", "application/json");
    let result = {"street": street, "city": city, "state": state, "zip": zip};
    req.send(JSON.stringify(result));
}