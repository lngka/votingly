"use strict";

/*eslint-disable no-undef */ /* defined in /common/DOMready.js*/
ready(function() {
    // the formID is the pollID, see /views/poll.hsb
    var pollID = document.querySelector("form").id;
    var canvas = document.getElementById("myChart");
    drawChart(canvas, pollID);
});

function drawChart(canvas,pollID) {
    // function ajaxRequest(method, url, requestObj, callback)
    ajaxRequest("GET","/api?q=getResult&pollID=" + pollID, null, function(result) {
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

        /*eslint-disable no-unused-vars*/// init the pie chart
        var pieChart = new Chart(canvas, {
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
