/**
 * Created by ptrbdr on 20.09.18.
 */

function smallChartTolik(data, feat) {

    var broadband = data.filter(function(d) {
        return d.koatuu == +feat.properties.koatuu
    });


    var result = data.map(a => a.munic_int_speed);

    // primitive histogramm
    function hist(data, hist_step, xlim){
        var h = make_array(0, xlim/hist_step);
        for(var i=-1, l=data.length; ++i < l;){
            var ind = Math.ceil((data[i] - xlim)/hist_step); // round numbers by lower boundary
            h[ind] = h[ind] || 0;
            h[ind] += 1;
        }
        return h;
    }

    function make_array(value, length) {
        var arr = [];
        while (length--) { arr[length] = value; }
        return arr;
    }

    var hist_step = 5;
    var xlim = 100;

// create chart for disciplines
    var margin = {top: 10, right: 10, bottom: 100, left: 10},
        margin2 = {top: 30, right: 10, bottom: 20, left: 10},
        width = 260 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom,
        height2 = 120 - margin2.top - margin2.bottom;


    var x = d3.scaleLinear().range([0, width]),
        x2 = d3.scaleLinear().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]);

    var xAxis = d3.axisBottom(),
        xAxis2 = d3.axisBottom().scale(x2).tickSize(4).ticks(5),
        yAxis = d3.axisLeft().scale(y);


    var chart_data = hist(result, hist_step, xlim)
        .map(function(d, i){return {bin:0+i*hist_step, freq:d} });

    var data = chart_data;
        x.domain([100, 200]);
        y.domain([0, d3.max(data.map(function(d) { return d.freq; }))]);
        x2.domain(x.domain());
        y2.domain(y.domain());

    var area2 = d3.area()
       // .curve("monotoneX")
        .x(function (d) {
            return x2(d.bin);
        })
        .y0(height2)
        .y1(function (d) {
            return y2(d.freq);
        })
        .curve(d3.curveCatmullRom.alpha(0.5));;

    var svg = d3.select("#histo").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)


//for(var i = -1, l = disc.length; ++i < l;   ){
// this clipping is for brash
    var defs = svg.append("defs");
    defs.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);



    var focus = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg.append("g")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");



    change_chart_colors(defs, feat);



    context.selectAll(".path")
        .data(["left", "right"])
        .enter().append("path")
        .attr("class", function (d) {
            return "path " + d;
        })
        .attr("clip-path", function (d) {
            return "url(#clip-" + d + ")";
        })
        .datum(data)
        .attr("d", area2);

    context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);
    //
    // context.append("g")
    //     .attr("class", "x brush")
    //     .call(brush)
    //     .selectAll("rect")
    //     .attr("y", -6)
    //     .attr("height", height2 + 7);

    function change_chart_colors(sel, school) {

        if (!d3.select("#clip-right").node()) { // create first
            // this one is for schools with higher score
            // svg.append('g').attr('class', 'rating_share')
            //     .attr('transform', 'translate(' + (x2.domain([100, 200])(100)) + ','
            //         + (40 + margin2.top) + ')')
            //     .append('text').text(
            //     d3.format('.0f')(100 - 100 * get_place(city_disc, school.id) / city_disc.length) + "%");

            sel.append("clipPath")
                .attr("id", "clip-right")
                .append("rect")
                .attr("x", x2.domain([0, 100])(20))
                .attr("width", width - x2.domain([0, 100])(20))
                .attr("height", height);

            // this one is for schools with lower score
            sel.append("clipPath")
                .attr("id", "clip-left")
                .append("rect")
                .attr("width", x2.domain([0, 100])(20))
                .attr("height", height);
        } else {
            // svg.select('.rating_share').select('text')
            //     .text(d3.format('.0f')(100 - 100 * get_place(city_disc, school.id) / city_disc.length) + "%");

            sel.select('#clip-right').select('rect')
                .attr("x", x2.domain([0, 100])(20))
                .attr("width", width - x2.domain([0, 100])(20))
                .attr("height", height);
            sel.select('#clip-left').select('rect')
                .attr("width", x2.domain([0, 100])(20))
                .attr("height", height);

        }

    }

}