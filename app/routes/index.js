const User = require("../models/users.js");
const Poll = require("../models/polls.js");

module.exports = function(app, passport) {
    app.route("/")
        .get(checkAuthentication, function(req, res){
            res.render("home");
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
                    res.render("login");
                }
            });
        });

    app.route("/create")
        .get(function(req, res) {
            res.render("create");
        })
        .post(function(req, res) {
            var formData = req.body;

            Poll.createNewPoll(formData, function(err, newPoll) {
                if (err) {
                    res.status(500).send("Error creating new poll by polls.js");
                } else {
                    res.status(200).send(newPoll);
                }
            });
        });

    function checkAuthentication(req, res, next){
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.render("login");
        }
    }
};
