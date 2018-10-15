/**
 * Created by ptrbdr on 28.09.18.
 */

function makeChart(data, margin, width, height, selectedKOATUU, intUserName) {

    window.data = data;
    window.selectedKOATUU = selectedKOATUU;


    var result = data.map(a => Math.round(+a[intUserName]));

    if (selectedKOATUU != undefined && !result.includes(+selectedKOATUU[0][intUserName])) {
        result.push(+selectedKOATUU[0][intUserName])
    }

    var speeds = {};

    result.forEach(function(d){
        speeds[d] = true;
    });

    var dataForChart = Object.keys(speeds).map(function(d){return +d}).filter(function(d) {return !isNaN(d)});

    // var intSpeedNotClean = data.map(function(d) {
    //     if (d.length == 1) {
    //         return d[0];
    //     }
    //     else {
    //         if (d.length == 2) {
    //             return d[0][0];
    //         }
    //         else {
    //             return "no"
    //         }
    //     }
    // });
    // //
    // data = intSpeedNotClean.filter(function(d) {return d != 'no'});

//     data.map(function(d) {
//         if (d.length == 1) {
//             return d[0][intUserName];
//         }
//      else {
//             if (d.length == 2) {
//                 return d[0][0][intUserName];
//             }
//         }
//     });
//
//
//
// // Тут проблема, прилітає надто багато позначок.
//     if (!data.includes(selectedKOATUU)) {
//         if (selectedKOATUU != null) {
//             data.push(selectedKOATUU);
//         }
//     }
//     // var result = data.map(a => [Math.round(a[intUserName]), a.koatuu]);
//
    var min = d3.min(dataForChart);
    var max = d3.max(dataForChart);
//
    var logScale = d3.scaleLog()
        .domain([min+0.1, max])
        .range([0, 100]);

    // var pairs = {};
    //
    // for (var i = 0; i < result.length; i++) {
    //     var num = result[i];
    //     pairs[num] = pairs[num] ? pairs[num] + 1 : 1;
    // }
    //
    // var result = Object.entries(pairs);

    // var selectedSpeed;
    //
    // if (selected.length > 0) {
    //     selectedSpeed = selected[0][intUserName];
    // }
    // else {
    //     selectedSpeed = null
    // }
    //
    //
    // if (selectedSpeed == null) {
    //     // d3.select("#histo " + "#" + intUserName).append("p").attr('class', 'cell').text('');
    // }
    // else {
    //     var speedOccurance = result.map(function(d) {return +d[0]} ).indexOf(Math.round(selectedSpeed));
    //
    //     var settmelts = result.slice(0, speedOccurance);
    //
    //     var number = 0;
    //
    //     settmelts.forEach(function(d) {
    //         number += d[1]
    //     });
    //
    //     var totalNumber = 0;
    //
    //     result.forEach(function(d) {
    //         totalNumber += d[1]
    //     });
    //
    //     // var possibleSpeeds = result.map(function(d) {return d[1]} ).sort(function(a, b){return a-b});
    //     //
    //     var percents= number/totalNumber * 100;
    //
    //     d3.select("#histo " + "#" + intUserName).append("p").attr('class', 'cell').text(
    //         // namesDict[intUserName] + ' ' +
    //         Math.round(percents) + "%"
    //     );
    //
    //
    //     // donutChart(Math.round(percents),intUserName);
    //     d3.select("#histo " + "#" + intUserName).append("p").attr('class', 'cell').text('' + namesDict[intUserName]);
    //
    //
    // }

    var svg = d3.select("#histo " + "#" + intUserName + '_second').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    // Потрібно переписати так, щоб малювало один раз для однієї швидкості і шукало співпадіння по швидкості
    g.selectAll(".bar")
        .data(dataForChart)
        .enter().append("rect")
        .attr('id', function (d) {
                return "id" + d + "_" + intUserName;
        })
        .attr("class", function (d) {
                return "bar"
        })
        .attr("x", function (d) {
                return logScale(+d + 1);
        })
        .attr("y", 0)
        .attr("width", 1)
        .attr("height", function (d) {
                return height;
        });






    changeClass(selectedKOATUU);



    function changeClass(selectedKOATUU) {
        if (selectedKOATUU != null && selectedKOATUU.length > 0) {
            if (selectedKOATUU.length == 1) {
                d3.selectAll("#id" + Math.round(selectedKOATUU[0][intUserName]) + "_" + intUserName) //.style('fill', 'red');
                    .style('height', function (d) {
                        return height + 10
                    })
                    .style('width', function (d) {
                        return 2
                    })
                    .style('fill', function (d) {
                        return "red"
                    })
                    .attr('y', function (d) {
                        return -5
                    })
            }
            else {
                d3.selectAll('.bar')
                    .style('height', function (d) {
                        return height + 10
                    })

                    .style('width', function (d) {
                        return 2
                    })
                    .style('fill', function (d) {
                        return "blue"
                    })
                    .attr('y', function (d) {
                        return -5
                    })
            }
        }
    }



}