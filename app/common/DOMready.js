
/*eslint-disable no-unused-vars*/// this is imported to the front end
function ready (callback) {
    if (typeof callback !== "function") {
        return;
    }

    if (document.readyState === "complete") {
        return callback();
    }

    document.addEventListener("DOMContentLoaded", callback, false);
}
