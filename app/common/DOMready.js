function ready (callback) {
    if (typeof callback !== "function") {
        return;
    }

    if (document.readyState === "complete") {
        return callback();
    }

    document.addEventListener("DOMContentLoaded", callback, false);
}

module.exports = ready;
