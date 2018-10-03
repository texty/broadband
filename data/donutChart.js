/**
 * Created by ptrbdr on 01.10.18.
 */
function donutChart(d, intUserName) {
    var data = [
        {name: 'cats', count: d, percentage: d, color: '#000000'},
        {name: 'dogs', count: 100-d, percentage: 100-d, color: '#f8b70a'}
    ];
    var totalCount = d;		//calcuting total manually

    var width = 50,
        height = 50,
        radius = 20;

    var arc = d3.arc()
        .outerRadius(radius - 2)
        .innerRadius(5);

    var pie = d3.pie()
        .sort(null)
        .value(function(d) {
            return d.count;
        });

    var svg = d3.select('.donut').append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d,i) {
            return d.data.color;
        });

    // g.append("text")
    //     .attr("transform", function(d) {
    //         var _d = arc.centroid(d);
    //         _d[0] *= 1.5;	//multiply by a constant factor
    //         _d[1] *= 1.5;	//multiply by a constant factor
    //         return "translate(" + _d + ")";
    //     })
    //     .attr("dy", ".50em")
    //     .style("text-anchor", "middle")
    //     .text(function(d) {
    //         if(d.data.percentage < 8) {
    //             return '';
    //         }
    //         return d.data.percentage + '%';
    //     });

    g.append("text")
        .attr("text-anchor", "middle")
        .attr('font-size', '4em')
        .attr('y', 20)
        .text(totalCount);
}