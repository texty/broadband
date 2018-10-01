/**
 * Created by ptrbdr on 21.09.18.
 */


var chartCode = {
    
    func: function smallChartBarcode(feat) {

    getJSON('data/broadband.json', function(data) {

        var selected;

        data.forEach(function(d) {
            if (feat != "first") {
                d3.selectAll('#histo .tableRow *').remove()
                selected = data.filter(function(d) {return d.koatuu == +feat.koatuu} );
            }
            else {
                selected = [];
            }
        });
        
// create chart for disciplines
            var margin = {top: 1, right: 1, bottom: 1, left: 1},
                width = 150 - margin.left - margin.right,
                height = 20 - margin.top - margin.bottom;

        makeChart(data, margin, width, height, selected, 'munic_int_speed');
        makeChart(data, margin, width, height, selected, 'household_int_speed');
        makeChart(data, margin, width, height, selected, 'edu_int_speed');
        makeChart(data, margin, width, height, selected, 'health_int_speed');
        makeChart(data, margin, width, height, selected, 'culture_int_speed');

    });

}
};
