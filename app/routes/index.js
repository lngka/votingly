const User = require("../models/users.js");
const Poll = require("../models/polls.js");

module.exports = function(app) {
    app.route("/")
        .get(function(req, res){
            // checkAuthentication middleware not used to avoid unnecessary flash message to user
            if (!req.isAuthenticated()) {
                res.redirect("/login");
            } else {
                res.render("home");
            }
        });

    app.route("/login")
        .get(function(req, res){
            var options = {
                "css": "/public/css/login.css"
            };
            res.render("login", options);
        });

    app.route("/logout")
        .get(function(req, res) {
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
                    res.render("create");
                } else {
                    req.flash("success", "New poll created!!");
                    res.render("create");
                }
            });
        });

    app.route("/poll/:pollID")
        .get(function(req, res) {
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
                        "pollID": pollID,
                        "css": "/public/css/poll.css"
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
                    return res.redirect("/");
                }

                if (polls.length == 0) {// When there are no matches Poll.getPollByUserID returns empty array
                    req.flash("message", "You have no poll yet, create one here!");
                    return res.redirect("/create");
                }
                return res.render("mypolls", {polls});
            });
        });

    app.route("/allpolls")
        .get(function(req, res) {
            Poll.find({}, function(err, polls) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("/");
                } else {
                    var options = {
                        "polls": polls,
                        "css": "/public/css/allPolls.css"
                    };
                    res.render("allPolls", options);
                }
            });
        });

    app.route("/vote/:pollID")
        .get(checkAuthentication, checkAlreadyVoted, function(req, res) {
            var userID = req.user.id;
            var pollID = req.params.pollID;
            var choiceIndex = req.query.choice;

            // if user is anonymous then the vote is saved with IP address instead of userID
            if (userID == process.env.ANON_USER_ID) {
                Poll.anonymousVote(req.ip, pollID, choiceIndex, function(err) {
                    if (err) {
                        req.flash("error", err.message);
                        return res.redirect("back");
                    } else {
                        req.flash("success", "It is, like, *your* opinion");
                        return res.redirect("back");
                    }
                });
            } else {
                Poll.vote(userID, pollID, choiceIndex, function(err) {
                    if (err) {
                        req.flash("error", err.message);
                        return res.redirect("back");
                    } else {
                        req.flash("success", "It is, like, *your* opinion");
                        return res.redirect("back");
                    }
                });
            }
        });

    function checkAuthentication(req, res, next){
        if (req.isAuthenticated()) {
            return next();
        } else {
            req.flash("error", "Not authenticated");
            res.redirect("/login");
        }
    }

    function checkAlreadyVoted(req, res, next) {
        var pollID = req.params.pollID;
        var userID = req.user.id;
        if (userID == process.env.ANON_USER_ID) {
            return next();
        } else {
            Poll.count({
                "_id": pollID,
                "participants": userID
            }, function(err, count) {
                if (count) {
                    req.flash("error", "You already voted on this poll");
                    res.redirect("back");
                } else {
                    next();
                }
            });
        }
    }
};
