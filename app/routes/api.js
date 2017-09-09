"use strict";
const Poll = require("../models/polls.js");

module.exports = function(app) {
    // this api endpoint accepts requests in form of /api?q={query}&pollID={pollID}
    app.route("/api")
        .get(function(req, res) {
            var q = req.query.q;
            if (q == "getResult") {
                var pollID = req.query.pollID;
                Poll.getResult(pollID, function(err, result) {
                    if (err) {
                        return res.send(err);
                    } else {
                        return res.json(result);
                    }
                });
            } else {
                res.status(400).send("Bad Request, query not recognized");
            }
        });
};
