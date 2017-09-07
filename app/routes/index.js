const User = require("../models/users.js");
const Poll = require("../models/polls.js");

module.exports = function(app, passport) {
    app.route("/")
        .get(function(req, res){
            // checkAuthentication middleware not used to avoid unnecessary flash message to user
            if (!req.isAuthenticated()) {
                res.render("login");
            } else {
                res.render("home");
            }
        });

    app.route("/login")
        .get(function(req, res){
            res.render("login");
        })
        .post(passport.authenticate("local", {
            "successRedirect": "/",
            "failureRedirect": "/login",
            "failureFlash": true,
            "successFlash": "Welcome!!"
        }));

    app.route("/auth/anonymous")
        .get(passport.authenticate("anonymous", {
            // normally anonymous logins are non-persistent according to passport-anonymous.Strategy
            // Usage of persistent login require a registered user with its own _id in database
            "session": true
        }), function(req, res) {
            // a user named Anonymous is created beforehand, its ID  saved in .env
            // this user is granted limited functionality in the app
            // persistent login for this user require "manual" writting in session.passport object
            // because Anonymous is logged via this route, NOT through the browser's login form
            req.session.passport = {"user": {"_id": process.env.ANON_USER_ID}};
            req.flash("success", "Logged you in anonymously");
            res.redirect("/");
        });
    app.route("/logout")
        .get(checkAuthentication, function(req, res) {
            req.logout();
            req.flash("message", "Successfully logged out!");
            res.redirect("login");
        });

    app.route("/register")
        .get(function(req, res) {
            res.render("register");
        })
        .post(function(req, res) {
            var username = req.body.username;
            var email = req.body.email;
            var password = req.body.password;
            User.createNewUser(username, password, email, function(err) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("/register");
                } else {
                    req.flash("success", "Successfully registered! You can now login.");
                    res.redirect("/login");
                }
            });
        });

    app.route("/create")
        .get(checkAuthentication, function(req, res) {
            res.render("create");
        })
        .post(function(req, res) {
            var formData = req.body;

            Poll.createNewPoll(formData, req.user, function(err) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("/create");
                } else {
                    req.flash("success", "New poll created!!");
                    res.redirect("/mypolls");
                }
            });
        });

    app.route("/poll/:pollID")
        .get(checkAuthentication, function(req, res) {
            const pollID = req.params.pollID;
            Poll.getPollByID(pollID, function(err, poll) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("/");
                } else {
                    // options contains varibles to be passed to handlebars
                    var options = {
                        "question": poll.question,
                        "author": poll.author,
                        "answers": poll.answers,
                        "pollID": pollID
                    };
                    res.render("poll", options);
                }
            });
        });

    app.route("/remove/:pollID")
        .get(checkAuthentication, function(req, res) {
            const pollID = req.params.pollID;
            Poll.getPollByID(pollID, function(err, poll) {
                if (err) {
                    return res.json(err);
                }
                // prevent deletion of other's user's polls
                if (poll.author != req.user.id) {
                    req.flash("error", "Not authorized to delete");
                    return res.redirect("/mypolls");
                } else {
                    Poll.deletePollByID(pollID, function(err) {
                        if (err) {
                            req.flash("error", "Internal error, could not delete poll");
                            return res.redirect("/mypolls");
                        } else {
                            req.flash("success", "Poll deleted");
                            return res.redirect("/mypolls");
                        }
                    });
                }
            });
        });

    app.route("/mypolls")
        .get(checkAuthentication, function(req, res) {
            const userID = req.user.id;
            if (userID === process.env.ANON_USER_ID) {
                req.flash("error", "Only for registered user");
                return res.redirect("/");
            }
            Poll.getPollByUserID(userID, function(err, polls) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("/");
                } else {
                    res.render("mypolls", {polls});
                }
            });
        });

    app.route("/allpolls")
        .get(checkAuthentication, function(req, res) {
            Poll.find({}, function(err, polls) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("/");
                } else {
                    res.render("allPolls", {polls});
                }
            });
        });

    app.route("/vote/:pollID")
        .get(checkAuthentication, function(req, res) {
            var userID = req.user.id;
            var pollID = req.params.pollID;
            var choiceIndex = req.query.choice;
            Poll.vote(userID, pollID, choiceIndex, function(err) {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                } else {
                    req.flash("success", "It is, like, *your* opinion");
                    return res.redirect("back");
                }
            });
        });

    function checkAuthentication(req, res, next){
        if (req.isAuthenticated()) {
            return next();
        } else {
            req.flash("error", "Not authenticated");
            res.redirect("/login");
        }
    }
};
