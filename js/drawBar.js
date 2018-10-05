/**
 * Created by ptrbdr on 28.09.18.
 */

function makeChart(data, margin, width, height, selectedKOATUU, intUserName) {


    var namesDict = {'munic_int_speed': 'Органи місцевої влади',
        'edu_int_speed': 'Заклади освіти',
        'household_int_speed':'Користувачі',
        'health_int_speed':'Лікарні',
        'culture_int_speed':'Заклади культури'};

    

    var result = data.map(a => Math.round(a[intUserName]));

    // Тут проблема, прилітає надто багато позначок.
    if (!data.includes(selectedKOATUU)) {
        data.push(selectedKOATUU);
    }
    // var result = data.map(a => [Math.round(a[intUserName]), a.koatuu]);

    var min = d3.min(result);
    var max = d3.max(result);

    var logScale = d3.scaleLog()
        .domain([min+1, max])
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
            return d.koatuu + '';
        })
        .attr("class", function (d) {
            return "bar"
        })
        .attr("x", function (d) {
            return logScale(+d[intUserName]);
        })
        .attr("y", 0)
        .attr("width", 1)
        .attr("height", function (d) {
            return height;
        })
        .style("opacity", function (d) {
            return d[1] / 1000
        });


    changeClass(selectedKOATUU.koatuu);


    function changeClass(selectedKOATUU) {
        if (selectedKOATUU != null) {
            d3.selectAll('.bar')
                .attr('class', function (d) {
                    if (d.koatuu == selectedKOATUU) {
                        return 'barSelected'
                    }
                    else {
                        return 'bar'
                    }
                })
        }
    }




    // function donutChart(d, intUserName) {
    //     var data = [
    //         {name: 'cats', count: d, percentage: d, color: '#0000ff'},
    //         {name: 'dogs', count: 100-d, percentage: 100-d, color: '#fbf8f3'}
    //     ];
    //     var totalCount = d;		//calcuting total manually
    //
    //     var width = 50,
    //         height = 50,
    //         radius = 20;
    //
    //     var arc = d3.arc()
    //         .outerRadius(radius - 5)
    //         .innerRadius(10);
    //
    //     var pie = d3.pie()
    //         .sort(null)
    //         .value(function(d) {
    //             return d.count;
    //         });
    //
    //     var svg = d3.select("#histo " + "#" + intUserName).append('svg')
    //         .attr("width", width)
    //         .attr("height", height)
    //         .append("g")
    //         .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    //
    //     var g = svg.selectAll(".arc")
    //         .data(pie(data))
    //         .enter().append("g");
    //
    //     g.append("path")
    //         .attr("d", arc)
    //         .style("fill", function(d,i) {
    //             return d.data.color;
    //         });
    //
    //     // g.append("text")
    //     //     .attr("transform", function(d) {
    //     //         var _d = arc.centroid(d);
    //     //         _d[0] *= 1.5;	//multiply by a constant factor
    //     //         _d[1] *= 1.5;	//multiply by a constant factor
    //     //         return "translate(" + _d + ")";
    //     //     })
    //     //     .attr("dy", ".50em")
    //     //     .style("text-anchor", "middle")
    //     //     .text(function(d) {
    //     //         if(d.data.percentage < 8) {
    //     //             return '';
    //     //         }
    //     //         return d.data.percentage + '%';
    //     //     });
    //
    //     g.append("text")
    //         .attr("text-anchor", "middle")
    //         .attr('font-size', '0.5em')
    //         .attr('y', 1)
    //         .text(totalCount + "%");
    // }

}