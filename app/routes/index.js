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
                    res.redirect("/create");
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
                        "answers": poll.answers
                    };
                    res.render("poll", options);
                }
            });
        });

    app.route("/remove/:pollID")
        .get(checkAuthentication, function(req, res) {
            const pollID = req.params.pollID;
            console.log(pollID);
            Poll.getPollByID(pollID, function(err, poll) {
                console.log(poll.author);
                console.log(req.user.id);
                if (err) {
                    res.json(err);
                } else if (poll.author == req.user.id) {
                    Poll.deletePollByID(pollID, function(err) {
                        if (err) {
                            req.flash("error", "Internal error, could not delete poll");
                            res.redirect("/mypolls");
                        }
                        req.flash("success", "Poll deleted");
                        res.redirect("/mypolls");
                    });
                } else {
                    req.flash("error", "Not authorized to delete");
                    res.redirect("/mypolls");
                }
            });
        });

    app.route("/mypolls")
        .get(checkAuthentication, function(req, res) {
            const userID = req.user.id;
            Poll.getPollByUserID(userID, function(err, polls) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("/");
                } else {
                    res.render("mypolls", {polls});
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
