/**
 * Created by ptrbdr on 28.09.18.
 */

function makeChart(data, margin, width, height, selected, intUserName) {


    var namesDict = {'munic_int_speed': 'Органи місцевої влади',
        'edu_int_speed': 'Заклади освіти',
        'household_int_speed':'Користувачі',
        'health_int_speed':'Лікарні',
        'culture_int_speed':'Заклади культури'};

    

    var result = data.map(a => Math.round(a[intUserName]))

    var pairs = {};

    for (var i = 0; i < result.length; i++) {
        var num = result[i];
        pairs[num] = pairs[num] ? pairs[num] + 1 : 1;
    }

    var result = Object.entries(pairs);

    var selectedSpeed;

    if (selected.length > 0) {
        selectedSpeed = selected[0][intUserName];

        if (selectedSpeed === null) {

        }

    }
    else {
        selectedSpeed = null
    }


    // var x = d3.scaleBand()
    //         .rangeRound([0, width])
    //         .padding(1),
    //     y = d3.scaleLinear().rangeRound([height, 0]);
    //
    // x.domain(result.map(function (d) {
    //     return +d[0];
    // }));


    // Ніфіга, якась помилка

    if (selectedSpeed == null) {
        d3.select("#histo " + "#" + intUserName).append("p").attr('class', 'cell').text('');
    }
    else {
        var speedOccurance = result.map(function(d) {return +d[0]} ).indexOf(Math.round(selectedSpeed));

        var settmelts = result.slice(0, speedOccurance);

        var number = 0;

        settmelts.forEach(function(d) {
            number += d[1]
        });

        var totalNumber = 0;

        result.forEach(function(d) {
            totalNumber += d[1]
        });

        // var possibleSpeeds = result.map(function(d) {return d[1]} ).sort(function(a, b){return a-b});
        //
        var percents= number/totalNumber * 100;

        d3.select("#histo " + "#" + intUserName).append("p").attr('class', 'cell').text(
            // namesDict[intUserName] + ' '
            Math.round(percents) + "%"
        );
    }


    var svg = d3.select("#histo " + "#" + intUserName).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.selectAll(".bar")
        .data(result)
        .enter().append("rect")
        .attr("class", function (d) {
            if (selected.length == 0) {
                return "bar"
            }
            else {
                if (selectedSpeed == +d[0]) {
                    return "barSelected"
                }
                else {
                    return "bar"
                }
            }

        })
        .attr("x", function (d) {
            return +d[0];
        })
        .attr("y", 0)
        .attr("width", 1)
        .attr("height", function (d) {
            return height;
        })
        .style("opacity", function (d) {
            return d[1] / 1000
        });

}