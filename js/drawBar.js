/**
 * Created by ptrbdr on 28.09.18.
 */

function makeChart(data, margin, width, height, selected, intUserName) {

    var result = data.map(a => Math.round(a[intUserName]))

    var pairs = {};

    for (var i = 0; i < result.length; i++) {
        var num = result[i];
        pairs[num] = pairs[num] ? pairs[num] + 1 : 1;
    }

    var result = Object.entries(pairs);

    var selectedSpeed

    if (selected.length > 0) {
        selectedSpeed = selected[0][intUserName];

    }
    else {
        selectedSpeed = null
    }

    var x = d3.scaleBand()
            .rangeRound([0, width])
            .padding(1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    x.domain(result.map(function (d) {
        return +d[0];
    }));


    var svg = d3.select("#histo").append("svg")
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
            return x(+d[0]);
        })
        .attr("y", 0)
        .attr("width", 1)
        .attr("height", function (d) {
            return height - 50;
        })
        .style("opacity", function (d) {
            return d[1] / 1000
        });

}