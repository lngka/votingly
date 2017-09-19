const submitBtn = document.querySelector("#submitBtn");

submitBtn.addEventListener("click", function(event) {
    event.preventDefault();

    var form = document.forms.formCreatePoll;
    var choiceElements = form.getElementsByClassName("choice");

    // validate question field
    if (form.question.value.length < 3) {
        return alert("Question invalid!");
    }

    // forEach can not be called directly from choiceElements
    // because choiceElements is NOT an Array, but HTMLcollection
    var regex = /\S+/i;
    var choicesArray = [];
    Array.prototype.forEach.call(choiceElements, function(el) {
        // accept only if input have atleast 1 alphanumeric character
        if (regex.test(el.value)) {
            choicesArray.push(el.value);
        }
    });

    // validate choice fields
    if (choicesArray.length < 2) {
        return alert("Allow at least two choices, please!");
    }

    // build request object
    var requestObj = {};

    requestObj.question = form.question.value;
    requestObj.answers = [];
    choicesArray.forEach(function(choice) {
        requestObj.answers.push({"choice": choice});
    });

    // send the request
    var url = window.location.origin + "/create";
    /*eslint-disable no-undef*/// ajaxRequest is defined in /app/common/ajaxFunctions
    // ajaxRequest(method, url, requestObj, callback)
    ajaxRequest("POST", url, requestObj, function(response) {
        console.log(response);
        window.location.replace("/create");
    });
});
