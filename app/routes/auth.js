"use strict";

module.exports = function(app, passport) {
    app.route("/auth/local")
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
            req.flash("message", "But I can't fix your personality");
            res.redirect("/");
        });
};
