/**
 * Created by ptrbdr on 21.09.18.
 */


var chartCode = {
    
    func: function smallChartBarcode(feat) {

    getJSON('data/broadband.json', function(data) {

            //var result = data.map(a => Math.round(a.munic_int_speed))
        

            // var pairs = {};
            //
            // for (var i = 0; i < result.length; i++) {
            //     var num = result[i];
            //     pairs[num] = pairs[num] ? pairs[num] + 1 : 1;
            // }
            //
            // var result = Object.entries(pairs);

        var selected;

        data.forEach(function(d) {
            if (feat != "first") {
                selected = data.filter(function(d) {return d.koatuu == +feat.koatuu} );
            }
            else {
                selected = [];
            }
        });



// create chart for disciplines
            var margin = {top: 1, right: 1, bottom: 1, left: 1},
                width = 260 - margin.left - margin.right,
                height = 80 - margin.top - margin.bottom;

        makeChart(data, margin, width, height, selected, 'munic_int_speed');
        makeChart(data, margin, width, height, selected, 'household_int_speed');
        makeChart(data, margin, width, height, selected, 'edu_int_speed');
        makeChart(data, margin, width, height, selected, 'health_int_speed');
        makeChart(data, margin, width, height, selected, 'culture_int_speed');

    });

}
};
