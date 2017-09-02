const addChoiceBtn = document.querySelector("#addChoice");
const choicesGroup = document.querySelector("#choicesGroup");
const MAX_CHOICE_NUM = 7;
var currentChoiceNum = 3;
addChoiceBtn.addEventListener("click", function(event) {
    event.preventDefault();

    if (currentChoiceNum === MAX_CHOICE_NUM) {
        return alert("You can only have max. 7 choices for a poll");
    }
    // choice2 is to be cloned because it doesn't have the "required" attribute
    var someChoice = document.querySelector("#choice2");
    var newChoice = someChoice.cloneNode();

    // newChoice has to be modified to avoid duplicate data being sent to server
    newChoice.setAttribute("name", "choice" + currentChoiceNum);
    newChoice.id = "choice" + currentChoiceNum;
    newChoice.placeholder = "";
    newChoice.value = "";
    
    // draw the newChoice on screen
    choicesGroup.appendChild(newChoice);

    // currentChoiceNum is to be increased by 1, so that the next newChoice can have the right attribute
    currentChoiceNum++;
});
