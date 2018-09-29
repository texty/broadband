/**
 * Created by ptrbdr on 20.09.18.
 */
function smallChart(data, feat) {
    var broadband = data.filter(function(d) {
        return d.koatuu == +feat.properties.koatuu
    });



    var result = data.map(a => a.munic_int_speed);
    // result = result.map(function(d) {if (isNaN(d)) {return 0} else return +d } )
    // result.sort(function(a, b){return +b - +a});


    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        margin = {top: 20, right: 30, bottom: 30, left: 40};

    var x = d3.scaleLinear()
        .domain([0, 150])
        .range([margin.left, width - margin.right]);
    
    var x2 = d3.scaleLinear().range([0, width])


    var y = d3.scaleLinear()
        .domain([0, 0.1])
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(x))
        .append("text")
        .attr("x", width - margin.right)
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .text("Time between eruptions (min.)");

    svg.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y).ticks(null, "%"));


    var n = result.length,
        bins = d3.histogram().domain(x.domain()).thresholds(100)(result),
        density = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40))(result);



    // svg.insert("g", "*")
    //         .attr("fill", "#bbb")
    //         .selectAll("rect")
    //         .data(bins)
    //         .enter().append("rect")
    //         .attr("x", function(d) { return x(d.x0) + 1; })
    //         .attr("y", function(d) { return y(d.length / n); })
    //         .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
    //         .attr("height", function(d) { return y(0) - y(d.length / n); });


    var defs = svg.append("defs");
    defs.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    defs.append("clipPath")
        .attr("id", "clip-right")
        .append("rect")
        .attr("x", x2.domain([100, 200])(101))
        .attr("width", width - x2.domain([100, 200])(101) )
        .attr("height", height);

    // this one is for schools with lower score
    defs.append("clipPath")
        .attr("id", "clip-left")
        .append("rect")
        .attr("width", x2.domain([100, 200])(101))
        .attr("height", height);

    var focus = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg.append("g")
        .attr("transform", "translate(" + "10px" + "," + "10px" + ")");

    context.data(["left", "right"])
        .enter()
        .append("path")
        .attr("class", function(dd) { return "path " + dd; })
        .attr("clip-path", function(dd) { return "url(#clip-" + dd + ")"; })
        .datum(density)
        .attr("fill", "steelblue")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("d",  d3.area()
            .curve(d3.curveBasis)
            .x(function(d) { return x(d[0]); })
            .y0(y(0))
            .y1(function(d) { return y(d[1]); }));

    function kernelDensityEstimator(kernel, X) {
        return function(V) {
            return X.map(function(x) {
                return [x, d3.mean(V, function(v) { return kernel(x - v); })];
            });
        };
    }

    function kernelEpanechnikov(k) {
        return function(v) {
            return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
    }    
}