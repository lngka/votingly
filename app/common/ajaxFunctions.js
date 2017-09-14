"use strict";
/* eslint-disable no-unused-vars*/
// used in create.sendRequest.client.js
// used in chart.controllers.client.js
function ajaxRequest(method, url, requestObj, callback) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            callback(xmlhttp.response);
        }
    };
    // XMLHttpRequest.open(method, url, async)
    xmlhttp.open(method, url, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xmlhttp.send(JSON.stringify(requestObj));
}
