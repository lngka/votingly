"use strict";
/*eslint-disable*/
ready(function() {
    const voteBtn = document.querySelector("#voteBtn");
    const voteForm = document.forms[0];//only one form in this page

    // if user is not logged in, voteBtn doesn't exist
    // instead a disabled <a> tag is rendered as a button, just to prompt user to log in
    if (!voteBtn) {
        return; //stop script
    }

    voteBtn.addEventListener("click", function(event) {
        event.preventDefault();

        var formData = new FormData(voteForm);
        var formJSON = FormDataToJSON(formData);

        // prevent sending request if parsed form data is empty
        if (!formJSON.hasOwnProperty("choice")) {
            return alert("Nope!");
        } else {
            // build request url, that is, top level address + /vote/{pollID}?choice={user selected choice index}
            var url = voteForm.action + "?choice=" + formJSON.choice;
            console.log(url);

            // ajaxRequest(method, url, requestObj, callback)
            ajaxRequest("POST", url, {}, function(response) {
                updateChart();
                console.log(response.statusCode);
                console.log(window.location.href);
                console.log(voteForm.action);
                window.location.replace(window.location.href);
            });
        }
    });

    function FormDataToJSON(formData){
        var ConvertedJSON= {};
        for (var [key, value]  of formData.entries()) {
            ConvertedJSON[key] = value;
        }
        return ConvertedJSON;
    }
});
