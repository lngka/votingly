const User = require("../models/users.js");

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
            User.createNewUser(username, password, email, function(err, user) {
                if (err) {
                    res.send(err);
                } else {
                    res.json(user);
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
