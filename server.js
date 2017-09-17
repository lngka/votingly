"use strict";

// requirements
const express        = require("express");
const path           = require("path");
const dotenv         = require("dotenv");
const mongoose       = require("mongoose");
const handlebars     = require("express-handlebars");
const bodyParser     = require("body-parser");
const cookieParser   = require("cookie-parser");
const session        = require("express-session");
const passport       = require("passport");
const configPassport = require("./app/config/passport.js");
const flash          = require("connect-flash");

// import routers
const indexRoute = require("./app/routes/index.js");
const authRoute  = require("./app/routes/auth.js");
const apiRoute  = require("./app/routes/api.js");

// init environment
dotenv.load();

// init database connection
mongoose.connect(process.env.MONGO_URI, {"useMongoClient": true});

// init app
const app = express();

// init view engine
app.set("views", path.join(process.cwd(), "views")); //default views folder
app.set("view engine", ".hbs"); //default file extension used for looking up views
app.engine("hbs", handlebars({"extname": ".hbs", "layoutsDir": "views/layouts", "defaultLayout": "main"})); //default engine used for .hbs files

// init static directory
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use("/app/common", express.static(path.join(process.cwd(), "app", "common")));
app.use("/app/controllers", express.static(path.join(process.cwd(), "app", "controllers")));

// init cookieParser
app.use(cookieParser("secretStr1ngT0encryptC00kl3s"));

// init session
app.use(session({
    "resave": false,
    "saveUninitialized": false,
    "secret": "secretStr1ngT0encryptC00kl3s"
}));

// init req.flash(), used by passportjs
app.use(flash());

// init passport
app.use(passport.initialize());
app.use(passport.session());
configPassport(passport);

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({"extended": true}));
app.use(bodyParser.json());

// init flash messages
app.use(function(req, res, next) {
    // the following error & success flash might be set by passportjs
    res.locals.error   = req.flash("error");
    res.locals.success = req.flash("success");
    // this flash is used to show user general messages
    res.locals.message = req.flash("message");
    next();
});

// expose user object to the view engine
app.use(function(req, res, next) {
    if (req.user && req.user.id == process.env.ANON_USER_ID) {
        res.locals.anonymous = true;
    }
    res.locals.user = req.user || null;
    next();
});

// routes configuration
indexRoute(app);
authRoute(app, passport);
apiRoute(app);

// start app
var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Listening on port: " + port || "3000");
});
