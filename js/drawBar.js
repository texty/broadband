/**
 * Created by ptrbdr on 28.09.18.
 */

function makeChart(data, margin, width, height, selectedKOATUU, intUserName) {



    var namesDict = {'munic_int_speed': 'Органи місцевої влади',
        'edu_int_speed': 'Заклади освіти',
        'household_int_speed':'Користувачі',
        'health_int_speed':'Лікарні',
        'culture_int_speed':'Заклади культури'};

    

    // var result = data.map(a => Math.round(a[intUserName]));

    var intSpeedNotClean = data.map(function(d) {
        if (d.length == 1) {
            return d[0];
        }
        else {
            if (d.length == 2) {
                return d[0][0];
            }
            else {
                return "no"
            }
        }
    });
    //
    data = intSpeedNotClean.filter(function(d) {return d != 'no'});

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
//     var min = d3.min(result);
//     var max = d3.max(result);
//
    var logScale = d3.scaleLog()
        .domain([1, 300])
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

    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr('id', function (d) {
            if (d != undefined){
                return "id" + d.koatuu;
            }
        })
        .attr("class", function (d) {
            if (d != undefined) {
                return "bar"
            }
        })
        .attr("x", function (d) {
            if (d != undefined){
                return logScale(+d[intUserName] + 1);
            }
        })
        .attr("y", 3)
        .attr("width", 1)
        .attr("height", function (d) {
            if (d != undefined) {
                return height;
            }
        })
        .style("opacity", function (d) {
            if (d != undefined) {
                return d[1] / 1000
            }
        });





    changeClass(selectedKOATUU);


    // function changeClass(selectedKOATUU) {
    //     if (selectedKOATUU != null) {
    //         d3.selectAll('.bar')
    //             .attr('class', function (d) {
    //                 if (d.koatuu == selectedKOATUU.koatuu) {
    //                     return 'barSelected'
    //                 }
    //                 else {
    //                     return 'bar'
    //                 }
    //             })
    //     }
    // }

    function changeClass(selectedKOATUU) {
        if (selectedKOATUU != null && selectedKOATUU.length > 0) {
            d3.selectAll("#id" + selectedKOATUU[0].koatuu)
                .style('height', function (d) {
                        return height + 3
                })
                .style('fill', function (d) {
                        return "red"
                })
                .attr('y', function (d) {
                        return 9
                })
        }
    }



}