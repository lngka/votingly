const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/users.js");

module.exports = function(passport) {
    passport.use(new LocalStrategy(
        function(username, password, done) {
            User.findOne({ "local.username": username }, function (err, user) {
                if (err) { return done(err, null); }
                if (!user) {
                    return done(null, false, { "message": "Incorrect username." }); // here passportjs calls flash("error", "Incorrect username.")
                } else {
                    User.checkValidLocalPassword(user, password, function(err, isCorrect) {
                        if (err) {
                            return done(err, null);
                        } else if (isCorrect) {
                            return done(null, user);
                        } else {
                            return done(null, false, { "message": "Incorrect password." });
                        }
                    });
                }
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};
