/**
 * Created by ptrbdr on 21.09.18.
 */


var chartCode = {
    
    func: function smallChartBarcode(feat) {

    getJSON('data/broadband.json', function(data) {

        var boundCoordinates = [[project(Object.values(feat)[0])],[project(Object.values(feat)[1])]];
        var boundCities = tree.search({
            minX: boundCoordinates[0].x,
            minY: boundCoordinates[1].y,
            maxX: boundCoordinates[1].x,
            maxY: boundCoordinates[0].y
        });

        var boundKOATUU = boundCities.map(function(d) {return d.feature.koatuu } );

        var dataFiltered = data.filter(f => boundKOATUU.includes(f.koatuu));

        var selected;

        data.forEach(function(d) {
            if (feat != "first") {
                d3.selectAll('#histo .tableRow *').remove();
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

        makeChart(dataFiltered, margin, width, height, selected, 'munic_int_speed');
        makeChart(dataFiltered, margin, width, height, selected, 'household_int_speed');
        makeChart(dataFiltered, margin, width, height, selected, 'edu_int_speed');
        makeChart(dataFiltered, margin, width, height, selected, 'health_int_speed');
        makeChart(dataFiltered, margin, width, height, selected, 'culture_int_speed');

    });

}
};
