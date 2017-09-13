"use strict";
// define in global scope so that updateChart can work
var chart = {};

/*eslint-disable no-undef */ /* defined in /common/DOMready.js*/
ready(function() {
    // the formID is the pollID, see /views/poll.hsb
    var pollID = document.querySelector("form").id;
    var canvas = document.getElementById("myChart");
    drawChart(canvas, pollID);
});

/*
* function to drawChart immediately after DOM is loaded
* @param canvas {DOM element object}: a HTML <canvas> element
* @param pollID {string}: a string of ObjectId type representing the poll ID
*/
function drawChart(canvas, pollID) {
    // function ajaxRequest(method, url, requestObj, callback)
    ajaxRequest("GET", "/api?q=getResult&pollID=" + pollID, null, function(result) {
        result = JSON.parse(result);

        // check if response is valid
        if(!result.count.length) {
            console.log(result);
            return;
        }

        // individual labels of each data entry
        var labels = result.answers;
        // data set
        var data = result.count;
        // color of each entry
        var backgroundColor = ["#F48FB1", "#B39DDB", "#81D4FA", "#A5D6A7", "#FFE082", "#BCAAA4", "#B0BEC5"];

        /*eslint-disable no-unused-vars*/// init the pie chart, available in global scope
        chart = new Chart(canvas, {
            "type": "doughnut",
            "data": {
                "labels": labels,
                "datasets": [{
                    "data": data,
                    "backgroundColor": backgroundColor,
                    "borderWidth": 2 //pixels
                }]
            },
            "options" : {
                "legend": {
                    "position": "bottom"
                },
                "tooltips": {
                    "position": "nearest",
                    "callbacks": {
                        "afterLabel": addPercent2Tooltip //http://www.chartjs.org/docs/latest/configuration/tooltip.html
                    }
                }
            }
        });

        // calculate the percent presentation of each entry out of the dataset
        var totalVoteCount = data.reduce((accumulator, currentItem) => {
            return accumulator + currentItem;
        });
        var percentage = [];
        data.forEach((voteCount) => {
            var percentValue = (voteCount/totalVoteCount)*100;
            percentage.push(percentValue.toFixed(2));
        });

        // http://www.chartjs.org/docs/latest/configuration/tooltip.html#tooltip-callbacks
        function addPercent2Tooltip (tooltipItem, data) {
            return "(" + percentage[tooltipItem.index] + "%)";
        }
    });
}

/* function to update existing chart
*  used in app\controllers\vote.controller.client.js
*/
function updateChart() {
    var pollID = document.querySelector("form").id;

    // function ajaxRequest(method, url, requestObj, callback)
    ajaxRequest("GET", "/api?q=getResult&pollID=" + pollID, null, function(result) {
        result = JSON.parse(result);

        // check if response is valid
        if(!result.count.length) {
            console.log(result);
            return;
        }

        // new data set
        var labels = result.answers;
        var data = result.count;

        // must update the labels as well
        // chart.data.labels = labels;
        while(chart.data.labels.length > 0) {
            chart.data.labels.pop();
        }
        labels.forEach(function(label) {
            chart.data.labels.push(label);
        });

        // replace chart.data.datasets.data DOESN'T WORK (https://github.com/chartjs/Chart.js/issues/3614)
        // chart.data.datasets is an array
        chart.config.data.datasets[0].data = data;

        chart.update();
    });
}
