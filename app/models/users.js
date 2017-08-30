"use strict";
// requirements
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

// the schema itself
const mySchema = new Schema({
    "local": {
        "username": {
            "type": String,
            "unique": true
        },
        "hashedPassword": String,
        "email": String
    }
});

// the constant User is exported and also used for other model operations
const User = mongoose.model("User", mySchema);
module.exports = User;

/*
* @param username {string}: the username which was typed in the register form
* @enteredPassword {string}: the password which was typed in the register form
* @callback {function}: called after check with the following parameters: err, newUser
*/
module.exports.createNewUser = function (username, enteredPassword, email, callback) {
    // first we have to know if username already exist
    User.findOne({"username": username}, function(err, result) {
        if (err) {
            return callback(err, null);
        }
        if (result) {
            var newError = new Error("Username already exist");
            return callback(newError, result);
        } else {
            // bcrypt is used to create a hash from the entered password
            // the hash is then stored in database
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(enteredPassword, salt, function(err, hash) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        var newUser = new User();
                        newUser.local.username = username;
                        newUser.local.email = email;
                        newUser.local.hashedPassword = hash;
                        newUser.save(callback);
                    }
                });
            });
        }
    });
};

/*
* @param user {object}: mongo doc representing the user
* @param enteredPassword {string}: the string which was typed in the login form
* @param callback {function}: called after check with the following parameters:
* @callback-param err {object}: bcrypt runtime error
* @callback-param isCorrect {boolean}: true if password match the hash in database, false otherwise
*/
module.exports.checkValidLocalPassword = function (user, enteredPassword, callback) {
    var hashedPassword = user.local.hashedPassword;
    bcrypt.compare(enteredPassword, hashedPassword, function(err, isCorrect) {
        return callback(err, isCorrect);
    });
};
