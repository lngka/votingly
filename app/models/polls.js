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
    }
});

// revision of each document is NOT needed
mySchema.set("versionKey", false);
// the constant User is exported and also used for other model operations
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
