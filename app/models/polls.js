"use strict";
// requirements
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// the schema itself
const mySchema = new Schema({
    "createdBy": {
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
module.exports.createNewPoll = function (formData, user, callback) {
    // user must be logged in to create new poll
    if (!user) {
        var userError = new Error("Not logged in");
        return callback(userError, null);
    }

    var newPoll = new Poll(formData);
    newPoll.save(function(err, poll) {
        if (err) {
            return callback(err, null);
        } else {
            return callback(null, poll);
        }
    });
};
