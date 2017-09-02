
/* eslint-disable no-unused-vars*/
// ajaxSendJSON is imported and used in create.addEmptyChoice.client.js
function ajaxSendJSON (method, url, requestObj, callback) {
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
