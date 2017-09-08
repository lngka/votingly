"use strict";
// requirements
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// the schema itself
const mySchema = new Schema({
    "author": {
        "type": String,
        "default": "Anonymous"
    },
    "question": String,
    "answers": [{
        "_id": false,
        "choice": String,
        "votedBy": Array,
        "voteNbr": {
            "type": Number,
            "default": 0
        }
    }],
    "participants": {
        "type": Array,
        "default": []
    },
    "pollURL": {
        "type": String,
        "default": ""
    },
    "removeURL": {
        "type": String,
        "default": ""
    }
});

// revision of each document is NOT needed
mySchema.set("versionKey", false);
// the constant Poll is exported and also used for other model operations
const Poll = mongoose.model("Poll", mySchema);
module.exports = Poll;

/*
* @param formData {object}: the formData which was typed in the creation form
* @callback {function}: called after check with the following parameters: err, newPoll
*/
module.exports.createNewPoll = function(formData, user, callback) {
    // user must be logged in to create new poll
    if (!user) {
        var userError = new Error("Not logged in");
        return callback(userError, null);
    }

    var newPoll = new Poll(formData);
    newPoll.author = user.id;

    // a poll is viewed by calling /poll/:pollID from browser
    newPoll.pollURL = process.env.APP_URL + "poll/" + newPoll.id;

    // a poll is deleted by calling /remove/:pollID from browser
    newPoll.removeURL = process.env.APP_URL + "remove/" + newPoll.id;

    newPoll.save(function(err, poll) {
        if (err) {
            return callback(err, null);
        } else {
            return callback(null, poll);
        }
    });
};

/*
* @param pollID {string}: the string presentation of ObjectID, error if string can not be casted to objectID
* @callback {function}: called after check with the following parameters: err, poll
*/
module.exports.getPollByID = function(pollID, callback) {
    Poll.findById(pollID, function(err, poll) {
        if (err) {
            return callback(err, null);
        } else if(!poll) { // When there are no matches find() returns [], while findOne() & findById() returns null
            var newError = new Error("No poll found");
            return callback(newError, null);
        }else {
            return callback(null, poll);
        }
    });
};

/*
* @param userID {string}: the string presentation of ObjectID, error if string can not be casted to objectID
* @callback {function}: called after check with the following parameters: err, poll
*/
module.exports.getPollByUserID = function(userID, callback) {
    Poll.find({"author": userID}, function(err, polls) {
        if (err) {
            return callback(err, null);
        } else if(polls.length === 0){// When there are no matches find() returns [], while findOne() & findById() returns null
            var newError = new Error("No poll found");
            return callback(newError, null);
        } else {
            return callback(null, polls);
        }
    });
};

/*
* @param pollID {string}: the string presentation of ObjectID, error if string can not be casted to objectID
* @callback {function}: called after check with the following parameters: err
* if no err returned then the poll matching id is removed
*/
module.exports.deletePollByID = function(pollID, callback) {
    Poll.remove({"_id": pollID}, function(err) {
        return callback(err);
    });
};

/*
* @param userID {string}: the string presentation of ObjectID, error if string can not be casted to objectID
* @param pollID {string}: the string presentation of ObjectID, error if string can not be casted to objectID
* @param choiceIndex {number}: the zero-based index position of the selected answer
* @callback {function}: called after check with the following parameters: err, isDone
*   @callback-param err {object}: An error instance representing the error during the execution
*   @callback-param isDone {Boolean}: true if operation succeed
*/
module.exports.vote = function(userID, pollID, choiceIndex, callback) {
    // access the choiceIndex-th element of the "answers" array
    // that is, if choiceIndex is 2 then we need to find and update answers.2
    var whereToVote = "answers" + "." + choiceIndex;
    Poll.findOneAndUpdate({"_id": pollID},
        // Note the square brackets around key. These are called computed property names.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#Computed_property_names
        // userID will be saved by the choice they select,and also in the list of "participants", "participants" will be checked to prevent multiple vote per user
        {$push: {
            [whereToVote + ".votedBy"]: userID,
            "participants": userID
        },
        $inc: {
            [whereToVote + ".voteNbr" ]: 1}
        },
        function(err) {
            if (err) {
                return callback(err, false);
            } else {
                return callback(null, true);
            }
        }
    );
};

/*
* @param userIP {string}: IP address of Anonymous user
* @param pollID {string}: the string presentation of ObjectID, error if string can not be casted to objectID
* @param choiceIndex {number}: the zero-based index position of the selected answer
* @callback {function}: called after check with the following parameters: err, isDone
*   @callback-param err {object}: An error instance representing the error during the execution
*   @callback-param isDone {Boolean}: true if operation succeed
*/
module.exports.anonymousVote = function(userIP, pollID, choiceIndex, callback) {
    // access the choiceIndex-th element of the "answers" array
    // that is, if choiceIndex is 2 then we need to find and update answers.2
    var whereToVote = "answers" + "." + choiceIndex;
    Poll.findOneAndUpdate({"_id": pollID},
        // Note the square brackets around key. These are called computed property names.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#Computed_property_names
        // userID will be saved by the choice they select,and also in the list of "participants", "participants" will be checked to prevent multiple vote per user
        {$push: {
            [whereToVote + ".votedBy"]: userIP,
            "participants": userIP
        },
        $inc: {
            [whereToVote + ".voteNbr" ]: 1}
        },
        function(err) {
            if (err) {
                return callback(err, false);
            } else {
                return callback(null, true);
            }
        }
    );
};
