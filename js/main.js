// /**
//  * Created by ptrbdr on 17.09.18.
//  */
// patch WebGL PIXI.mesh.MeshRenderer
// var _pixiGlCore2 = PIXI.glCore;
// PIXI.mesh.MeshRenderer.prototype.onContextChange = function onContextChange() {
//     var gl = this.renderer.gl;
//
//     this.shader = new PIXI.Shader(gl, 'attribute vec2 aVertexPosition;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n}\n', 'uniform vec4 uColor;\n\nvoid main(void)\n{\n    gl_FragColor = uColor;\n}\n');
// };

// PIXI.mesh.MeshRenderer.prototype.render = function render(mesh) {
//     var renderer = this.renderer;
//     var gl = renderer.gl;
//     var glData = mesh._glDatas[renderer.CONTEXT_UID];
//
//     if (!glData) {
//         renderer.bindVao(null);
//
//         glData = {
//             shader: this.shader,
//             vertexBuffer: _pixiGlCore2.GLBuffer.createVertexBuffer(gl, mesh.vertices, gl.STREAM_DRAW),
//             indexBuffer: _pixiGlCore2.GLBuffer.createIndexBuffer(gl, mesh.indices, gl.STATIC_DRAW)
//         };
//
//         // build the vao object that will render..
//         glData.vao = new _pixiGlCore2.VertexArrayObject(gl)
//             .addIndex(glData.indexBuffer)
//             .addAttribute(glData.vertexBuffer, glData.shader.attributes.aVertexPosition, gl.FLOAT, false, 2 * 4, 0);
//
//         mesh._glDatas[renderer.CONTEXT_UID] = glData;
//     }
//
//     renderer.bindVao(glData.vao);
//
//     renderer.bindShader(glData.shader);
//
//     glData.shader.uniforms.translationMatrix = mesh.worldTransform.toArray(true);
//
//     glData.shader.uniforms.uColor = PIXI.utils.premultiplyRgba(mesh.tintRgb, mesh.worldAlpha, glData.shader.uniforms.uColor);
//
//     glData.vao.draw(gl.TRIANGLE_STRIP, mesh.indices.length, 0);
// };


var getJSON = function(url, successHandler, errorHandler) {
    var xhr = typeof XMLHttpRequest != 'undefined'
        ? new XMLHttpRequest()
        : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('get', url, true);
    xhr.onreadystatechange = function() {
        var status;
        var data;
        if (xhr.readyState == 4) {
            status = xhr.status;
            if (status == 200) {
                data = JSON.parse(xhr.responseText);
                successHandler && successHandler(data);
            } else {
                errorHandler && errorHandler(status);
            }
        }
    };
    xhr.send();
};


document.addEventListener("DOMContentLoaded", function() {
    getJSON('data/data_geo_with_status.json', function (markers) {

        getJSON('data/broadband.json', function (broadband) {

            var broadband_map = d3.nest()
                .key(function(d) {
                    return d.koatuu;
                })
                .map(broadband);

            var privatIntSpeed = broadband.map(function(d) {return +d['household_int_speed']});

            function sortNumber(a,b) {
                return a - b;
            }

            function quantile(array, percentile) {
                array.sort(sortNumber);
                index = percentile/100. * (array.length-1);
                if (Math.floor(index) == index) {
                    result = array[index];
                } else {
                    i = Math.floor(index)
                    fraction = index - i;
                    result = array[i] + (array[i+1] - array[i]) * fraction;
                }
                return result;
            }


            var totalMaxSpeed = quantile(privatIntSpeed,95);
            var totalMinSpeed = 0;

            var speedLogScale = d3.scaleLog()
                .domain([totalMinSpeed + 0.1, totalMaxSpeed])
                .range([0, 1]);

            var speedColorScale = d3.interpolatePuBu;

            function rgb2hex(rgb){
                rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
                return (rgb && rgb.length === 4) ? "#" +
                ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
                ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
                ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
            }


            markers.features.forEach(function(marker) {
                // var result = broadband.filter(function(internet) {
                //     return internet.koatuu === marker.properties.koatuu;
                // });

                var result = broadband_map['$' + marker.properties.koatuu];

                if (result == undefined) {
                    result = [];
                }

                if (result.length == 0) {
                    marker.properties.internetInfo = [];
                }
                else if (result.length == 1) {
                    marker.properties.internetInfo = result
                }
                else {
                    var out = result.filter(function(d) {return marker.properties.name.includes(d.ato_name)});
                    if (out.length == 1)
                        marker.properties.internetInfo = out;
                    else {
                        if (out.length > 1) {
                            marker.properties.internetInfo = [out[0]];
                        }
                        else {
                            marker.properties.internetInfo = result;
                        }
                    }
                }

            });


        // markers.features = _.sampleSize(markers.features, 1000);
        // markers.features = marker.fus.features.filter(function(d) {return d.properties.name === "Київ місто"} )

        //var markerTexture = resources.marker.texture;
        var map = L.map('map').setView([50.451141, 30.522684], 8);


        var gl = L.mapboxGL({
            accessToken: 'pk.eyJ1IjoiZHJpbWFjdXMxODIiLCJhIjoiWGQ5TFJuayJ9.6sQHpjf_UDLXtEsz8MnjXw',
            maxZoom: 19,
            style: 'data/internet.json'
            // style: 'data/labels.json',
            // pane: 'tilePane'
        }).addTo(map);


        map.attributionControl.setPosition('bottomleft');
        map.zoomControl.setPosition('bottomright');



            // wrong way to find center of polygon
            (function () {
                // "use strict";

                function Point(x, y) {
                    this.x = x;
                    this.y = y;
                }

                function Region(points) {
                    this.points = points || [];
                    this.length = points.length;
                }

                Region.prototype.area = function () {
                    var area = 0,
                        i,
                        j,
                        point1,
                        point2;

                    for (i = 0, j = this.length - 1; i < this.length; j=i,i++) {
                        point1 = this.points[i];
                        point2 = this.points[j];
                        area += point1.x * point2.y;
                        area -= point1.y * point2.x;
                    }
                    area /= 2;

                    return area;
                };

                Region.prototype.centroid = function () {
                    var x = 0,
                        y = 0,
                        i,
                        j,
                        f,
                        point1,
                        point2;

                    for (i = 0, j = this.length - 1; i < this.length; j=i,i++) {
                        point1 = this.points[i];
                        point2 = this.points[j];
                        f = point1.x * point2.y - point2.x * point1.y;
                        x += (point1.x + point2.x) * f;
                        y += (point1.y + point2.y) * f;
                    }

                    f = this.area() * 6;

                    return new Point(x / f, y / f);
                };




            }());



            // adding leaflet layers with circles to mark cities with optical fiber connection;
            var center = function (arr)
            {
                var minX, maxX, minY, maxY;
                for (var i = 0; i < arr.length; i++)
                {
                    minX = (arr[i][0] < minX || minX == null) ? arr[i][0] : minX;
                    maxX = (arr[i][0] > maxX || maxX == null) ? arr[i][0] : maxX;
                    minY = (arr[i][1] < minY || minY == null) ? arr[i][1] : minY;
                    maxY = (arr[i][1] > maxY || maxY == null) ? arr[i][1] : maxY;
                }
                return [(minX + maxX) / 2, (minY + maxY) / 2];
            };

            var geojsonMarkers = markers.features.filter(function (marker) {
                if (marker.properties.internetInfo.length == 1 && marker.properties.internetInfo[0].optical_fiber_connection == 'Так') {

                    return marker;
                }
            }).map(function (marker) {
                var biggestArray = marker.geometry.coordinates.reduce((p, c, i, a) => a[p].length > c.length ? p : i, 0)

                if (marker.geometry.coordinates.length == 1) {
                    // var region = new Region(marker.geometry.coordinates[biggestArray][0]);
                    var centerPoint = center(marker.geometry.coordinates[biggestArray][0]);
                }
                else {
                    // var region = new Region(marker.geometry.coordinates[biggestArray]);
                    var centerPoint = center(marker.geometry.coordinates[biggestArray][0]);
                }



                var result = {
                    type: "Feature",
                    properties: marker.properties,
                    geometry: {
                        type: "Point",
                        coordinates: [centerPoint[0], centerPoint[1]]
                    }
                };

                return result;
            });

            var geojsonLayer = L.geoJson(geojsonMarkers, {
                style: {
                    "color": "#ff7800",
                    "weight": 5,
                    "opacity": 0.65
                },
                pointToLayer: function (feature, latlng) {
                    return new L.CircleMarker(latlng, {radius: 4, fillOpacity: 0.5});
                }
            });



        var pixiOverlay = (function () {
            var frame = null;
            var firstDraw = true;
            var prevZoom;
            var selectedCityData;



            var pixiContainer = new PIXI.Graphics();

            pixiContainer.interactive = true;
            pixiContainer.buttonMode = true;


            var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;


            markers.features.forEach(function (d) {
                if (d.geometry.coordinates.length == 1) {
                    d.geometry.coordinates[0][0].forEach(function (dd) {
                        dd.reverse()
                    })
                }

                else {
                    d.geometry.coordinates.forEach(function (b) {
                        b[0].forEach(function (bb) {
                            bb.reverse()
                        })
                    })
                }
            });
            var focus = null;

            return L.pixiOverlay(function (utils) {

                var zoom = utils.getMap().getZoom();
                var triangle = utils.getContainer();
                var circle = new PIXI.Graphics();
                var renderer = utils.getRenderer();
                var project = utils.latLngToLayerPoint;
                var scale = utils.getScale();


                //here map was drawn
                if (firstDraw) {
                    (function () {

                        var geocoder = L.Control.geocoder({
                            defaultMarkGeocode: false
                        })
                            .on('markgeocode', function(e) {
                                var feat = findFeature(e.geocode.center);
                                focusFeature(feat);

                                var bbox = e.geocode.bbox;
                                var poly = L.polygon([
                                    bbox.getSouthEast(),
                                    bbox.getNorthEast(),
                                    bbox.getNorthWest(),
                                    bbox.getSouthWest()
                                ]);
                                map.fitBounds(poly.getBounds());
                            })
                            .addTo(map);



                        var totalData = markers.features.map(function (dd) {
                            if (dd.geometry.coordinates.length <= 1) {
                                var coordObj = {
                                    "data": dd.geometry.coordinates[0].map(function (d) {
                                        return d.map(function (amb) {
                                            return project(amb)
                                        })
                                    }), 'status': dd.properties.status, 'koatuu': dd.properties.koatuu, 'internetInfo': dd.properties.internetInfo
                                };
                                return coordObj
                            }
                            else {
                                var coordObj = {
                                    data: dd.geometry.coordinates.map(function (polygon) {
                                        return polygon[0].map(function (p) {
                                            return project(p)
                                        })
                                    }), 'status': dd.properties.status, 'koatuu': dd.properties.koatuu, 'internetInfo': dd.properties.internetInfo
                                };
                                return coordObj
                            }
                        });

                        markers.features.forEach(function (dd) {
                            if (dd.geometry.coordinates.length <= 1) {
                                dd.geometry.coordinates[0].forEach(function (d, index, array) {
                                    array[index] = d.map(function (amb) {
                                        return project(amb)
                                    })
                                })
                            }
                            else {
                                dd.geometry.coordinates.forEach(function (polygon, index, array) {
                                    array[index] = polygon[0].map(function (p) {
                                        return project(p)
                                    })
                                })
                            }
                        });


                        var tree = rbush();

                        // Не працювала правильно. Для визначення полігону.
                        function containsPoint(polygon, p) {
                            var inside = false,
                                part, p1, p2, i, j, k, len, len2;
                            // ray casting algorithm for detecting if point is in polygon
                            for (i = 0, len = polygon.length; i < len; i++) {
                                part = polygon[i];

                                for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
                                    p1 = part[j];
                                    p2 = part[k];

                                    if (((p1[1] > p.y) !== (p2[1] > p.y)) && (p.x < (p2[0] - p1[0]) * (p.y - p1[1]) / (p2[1] - p1[1]) + p1[0])) {
                                        inside = !inside;
                                    }
                                }
                            }
                            return inside;
                        }



                        totalData.forEach(function (feature, index) {
                            var bounds;
                            if (feature.data.length == 1) {
                                bounds = L.bounds(L.bounds(feature.data[0]));

                                tree.insert({
                                    minX: bounds.min.x,
                                    minY: bounds.min.y,
                                    maxX: bounds.max.x,
                                    maxY: bounds.max.y,
                                    feature: feature
                                });


                            }
                            else {
                                feature.data.forEach(function (point) {
                                    bounds = L.bounds(L.bounds(point));
                                    // bounds = L.bounds(point);
                                    tree.insert({
                                        minX: bounds.min.x,
                                        minY: bounds.min.y,
                                        maxX: bounds.max.x,
                                        maxY: bounds.max.y,
                                        feature: feature
                                    });


                                });
                            }

                        });


                        // totalData = null;


                        // triangle.addChild(circle);


                        // Here I draw polygons
                        markers.features.forEach(function (projectedPolygon) {


                            var color, alpha;
                            if (projectedPolygon.properties.internetInfo.length == 1) {
                                // if (projectedPolygon.properties.internetInfo[0].optical_fiber_connection == 'Так') {
                                //     triangle.lineStyle(0.5 / scale, 0x4ae002, 1);
                                // }
                                // else {
                                //     triangle.lineStyle(0.5 / scale, 0x4ae002, 0);
                                // }

                                // alpha = 0.6;

                                var speedNumber = +projectedPolygon.properties.internetInfo[0].household_int_speed;

                                var speedConverted =  (Math.round(speedNumber) > totalMaxSpeed ? totalMaxSpeed : Math.round(speedNumber));
                                var rgbColorNumber = speedLogScale(speedConverted + 1);
                                var rgbColor = speedColorScale(rgbColorNumber);


                                var intermediateColor = rgb2hex(rgbColor);
                                color = intermediateColor.replace('#', '0x')

                            }
                            else {
                                // triangle.lineStyle(0.5 / scale, 0x4ae002, 0);
                                color = 0xd3d3d3;
                                alpha = 0.3;
                            }


                            if (projectedPolygon.geometry.coordinates.length <= 1) {

                                // triangle.lineStyle( 0x3388ff, 1);
                                triangle.beginFill(color, alpha);
                                projectedPolygon.geometry.coordinates[0][0].forEach(function (coords, index) {
                                    if (index == 0) triangle.moveTo(coords.x, coords.y);
                                    else triangle.lineTo(coords.x, coords.y);
                                });

                                triangle.endFill();

                                // var boundPolygon = L.bounds(projectedPolygon.geometry.coordinates[0][0].map(function(d) {return [d.x,d.y]}));
                                // var center = [boundPolygon.max.x + boundPolygon.min.x/2,boundPolygon.max.y + boundPolygon.min.y/2];
                                // var radius = Math.hypot(boundPolygon.max.x - boundPolygon.max.x, boundPolygon.max.y - boundPolygon.max.y)/2;



                                // triangle.beginFill(0xff3232, 1);
                                // // var center = {x: 108126.21000304745, y: 61788.73347298092};
                                // triangle.drawCircle(center[0], center[1], 20);
                                // triangle.endFill();
                                //
                                // triangle.addChild(circle)


                            }
                            else {
                                projectedPolygon.geometry.coordinates.forEach(function (pol) {
                                    // // triangle.lineStyle( 0x3388ff, 1);
                                    // triangle.beginFill(color, alpha);
                                    pol.forEach(function (coords, index) {
                                        // triangle.clear();
                                        // // triangle.lineStyle( 0x3388ff, 1);
                                        triangle.beginFill(color, alpha);

                                        if (index == 0) triangle.moveTo(coords.x, coords.y);
                                        else triangle.lineTo(coords.x, coords.y);
                                        triangle.endFill();
                                    });
                                })

                            }

                        });
                        // markers = null;

                        function findFeature(latlng) {
                            var point = project(latlng);
                            // alert(point.x+ " " +point.y);
                            var features = tree.search({
                                minX: point.x,
                                minY: point.y,
                                maxX: point.x,
                                maxY: point.y
                            });



                            // var features = tree.search({
                            //         minX: point.x,
                            //         minY: point.y,
                            //         maxX: point.x,
                            //         maxY: point.y
                            //     }).map((i) => items[i]);
                            
                            
                            
                            //working here !!!!!!!!!!!!!
                            //Потрібно змінити об'єкти на списки і після цього
                            // можна користуватися функцією для точного визначення полігона
                            
                            features.forEach(function(d) {
                                d.feature.data[0].forEach(function(d, i, arr) {
                                    arr[i] = Object.values(d);
                                })
                            });


                            var checker;
                            features.forEach(function (d) {
                                if (containsPoint(d.feature.data, point)){
                                    checker = true;
                                    features = [d];
                                }
                            });

                            if (checker) {
                                return features;
                            }

                        }

                        function focusFeature(feat) {
                            if (focus) focus.removeFrom(utils.getMap());
                            if (feat.length == 1) {
                                var geojson = {
                                    'type': 'Feature', 'geometry': {
                                        'type': 'MultiPolygon', 'coordinates': [feat[0].feature.data]
                                    }, 'properties': {}
                                };
                                focus = L.geoJSON(geojson, {
                                    coordsToLatLng: utils.layerPointToLatLng,
                                    style: function (feature) {
                                        return {
                                            fillColor: '#FFD700',
                                            fillOpacity: 0.5,
                                            stroke: true,
                                            color: '#FFD700'
                                        };
                                    },
                                    interactive: false
                                });

                                // chartCode.func(feat);

                                smallChartBarcode(map.getBounds(), feat);
                                focus.addTo(utils.getMap());
//
                            } else {
                                focus = null;
//										L.DomUtil.addClass(legend, 'hide');
                            }
                        }

                        utils.getMap().on('click', function (e) {
                            var feat = findFeature(e.latlng);
                            focusFeature(feat);
                        });

                        // старий і повільний код графіка

                        // function smallChartBarcode(feat, selection) {
                        //
                        //     getJSON('data/broadband.json', function (data) {
                        //         data.forEach(function (d) {
                        //             if (selection != null) {
                        //                 d3.selectAll('#histo .tableRow *').remove();
                        //                 selectedKOATUU = data.filter(function (d) {
                        //                     return d.koatuu == +selection.koatuu
                        //                 })[0];
                        //             }
                        //             else {
                        //                 d3.selectAll('#histo .tableRow *').remove();
                        //                 // selectedKOATUU = null;
                        //             }
                        //         });
                        //
                        //         var boundCoordinates = [[project(Object.values(feat)[0])], [project(Object.values(feat)[1])]];
                        //         var boundCities = tree.search({
                        //             minX: boundCoordinates[0][0].x,
                        //             minY: boundCoordinates[1][0].y,
                        //             maxX: boundCoordinates[1][0].x,
                        //             maxY: boundCoordinates[0][0].y
                        //         });
                        //
                        //         var boundKOATUU = boundCities.map(function (d) {
                        //             return d.feature.koatuu
                        //         });
                        //
                        //         var dataFiltered = data.filter(f => boundKOATUU.includes(f.koatuu));
                        //
                        //         var margin = {top: 1, right: 1, bottom: 1, left: 1},
                        //             width = 150 - margin.left - margin.right,
                        //             height = 20 - margin.top - margin.bottom;
                        //
                        //         makeChart(dataFiltered, margin, width, height, selectedKOATUU, 'household_int_speed');
                        //         makeChart(dataFiltered, margin, width, height, selectedKOATUU, 'edu_int_speed');
                        //         makeChart(dataFiltered, margin, width, height, selectedKOATUU, 'health_int_speed');
                        //         makeChart(dataFiltered, margin, width, height, selectedKOATUU, 'culture_int_speed');
                        //     });
                        // }


                        //поточний код, потрібно доробити
                        function smallChartBarcode(areaBounds, selectedCity) {
                            var boundCoordinates = [[project(Object.values(areaBounds)[0])], [project(Object.values(areaBounds)[1])]];
                            var boundCities = tree.search({
                                minX: boundCoordinates[0][0].x,
                                minY: boundCoordinates[1][0].y,
                                maxX: boundCoordinates[1][0].x,
                                maxY: boundCoordinates[0][0].y
                            });

                            // var boundCities = tree.search({
                            //         minX: boundCoordinates[0][0].x,
                            //         minY: boundCoordinates[1][0].y,
                            //         maxX: boundCoordinates[1][0].x,
                            //         maxY: boundCoordinates[0][0].y
                            //     }).map((i) => items[i]);

                            var boundCitiesData = boundCities.map(function(d) {return d.feature.internetInfo})
                                .filter(function(d) {return d.length > 0})
                                .map(function(d) {if (d.length > 1)  {
                                    return d[0];
                                }
                                else {
                                    return d[0];
                                }

                                });


                            // boundCitiesData = boundCities.map(function(d) {return d.feature.internetInfo});
                            // boundCities = null;

                            if (selectedCity != null) {
                                d3.selectAll('#histo .tableRow *').remove();
                                // d3.select('div.cityName').remove();
                                selectedCityData = selectedCity[0].feature.internetInfo;
                            }
                            else {
                                d3.selectAll('#histo .tableRow *').remove();
                                // selectedKOATUU = null;
                                // selectedCityData = []
                            }


                            var margin = {top: 40, right: 90, bottom: 20, left: 70},
                                width = 450 - margin.left - margin.right,
                                height = 95 - margin.top - margin.bottom;

                            makeChart(boundCitiesData, margin, width, height, selectedCityData, 'household_int_speed');


                            var swoopy = swoopyArrow()
                                .angle(Math.PI/2)
                                .x(function(d) { return d[0]; })
                                .y(function(d) { return d[1]; });

                            var tipsG = d3.select('div.tableRow.first svg').append("g")
                                .attr("class" ,"swoopy-tooltip")
                                .attr("transform", "translate(" + 10 + "," + -10 + ")");

                            tipsG.append("text")
                                .attr('y', 25)
                                .attr('x', 35)
                                .attr('text-anchor', "end")
                                .text('Мінімальна');


                            tipsG.append("text")
                                .attr('y', 35)
                                .attr('x', 35)
                                .attr('text-anchor', "end")
                                .text('швидкість');

                            tipsG.append("text")
                                .attr('y', 45)
                                .attr('x', 35)
                                .attr('text-anchor', "end")
                                .text('інтернету');


                            tipsG.append("text")
                                .attr('y', 55)
                                .attr('x', 35)
                                .attr('text-anchor', "end")
                                .text('по Україні');


                            tipsG.append("path")
                                .attr('marker-end', 'url(#arrowhead)')
                                .datum([[40, 85],[20, 65]])
                                .attr("d", swoopy);

                            d3.select('div.tableRow.first svg').append('g').html('<marker id="arrowhead" viewBox="-10 -10 20 20" refX="0" refY="0" markerWidth="10" markerHeight="10" stroke-width="1" orient="auto"><polyline stroke-linejoin="bevel" points="-6.75,-6.75 0,0 -6.75,6.75"></polyline></marker>')


                            var swoopy2 = swoopyArrow()
                                .angle(Math.PI/2)
                                .clockwise(false)
                                .x(function(d) { return d[0]; })
                                .y(function(d) { return d[1]; });

                            var tipsB = d3.select('div.tableRow.first svg').append("g")
                                .attr("class" ,"swoopy-tooltip")
                                .attr("transform", "translate(" + 390 + "," + -10 + ")");

                            tipsB.append("text")
                                .attr('y', 25)
                                .attr('x', 35)
                                .attr('text-anchor', "end")
                                .text('Максимальна');


                            tipsB.append("text")
                                .attr('y', 35)
                                .attr('x', 35)
                                .attr('text-anchor', "end")
                                .text('швидкість');

                            tipsB.append("text")
                                .attr('y', 45)
                                .attr('x', 35)
                                .attr('text-anchor', "end")
                                .text('інтернету');


                            tipsB.append("text")
                                .attr('y', 55)
                                .attr('x', 35)
                                .attr('text-anchor', "end")
                                .text('по Україні');


                            tipsB.append("path")
                                .attr('marker-end', 'url(#arrowhead)')
                                .datum([[0, 80],[20, 60]])
                                // .datum([[0, 80],[20, 60]])
                                .attr("d", swoopy2);


                            margin = {top: 5, right: 90, bottom: 10, left: 70},
                                width = 410 - margin.left - margin.right,
                                height = 70 - margin.top - margin.bottom;


                            makeChart(boundCitiesData, margin, width, height, selectedCityData, 'edu_int_speed');
                            makeChart(boundCitiesData, margin, width, height, selectedCityData, 'health_int_speed');
                            makeChart(boundCitiesData, margin, width, height, selectedCityData, 'culture_int_speed');
                            makeChart(boundCitiesData, margin, width, height, selectedCityData, 'munic_int_speed');

                            d3.select('div.cityName p').text(
                                selectedCityData == undefined || selectedCityData.length == 0 ? "Оберіть місто" : selectedCityData[0].ato_name
                            );



                            if (selectedCityData != undefined && selectedCityData.length != 0 && selectedCityData[0].optical_fiber_connection == 'Так') {
                                d3.select('div.cityName button.btn').style('opacity', 1);
                            }
                            else {
                                d3.select('div.cityName button.btn').style('opacity', 0);
                            }



                        }

                        smallChartBarcode(map.getBounds(), null);
                        map.on('moveend', function () {
                            smallChartBarcode(map.getBounds(), null);
                        });


                        totalData = null;
                    })();
                }
                firstDraw = false;
                prevZoom = zoom;


                renderer.render(triangle);


            }, pixiContainer, {
                doubleBuffering: doubleBuffering,
                autoPreventDefault: false
            });
        })();
        pixiOverlay.addTo(map);

            geojsonLayer.addTo(map);

            // window.pixiOverlay = pixiOverlay;


//             var pixiOverlay2 = (function () {
//                 var frame = null;
//                 var firstDraw = true;
//                 var prevZoom;
//                 var selectedCityData;
//
//                 var pixiContainer = new PIXI.Graphics();
//
//                 pixiContainer.interactive = true;
//                 pixiContainer.buttonMode = true;
//
//
//                 var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
//
//
//                 // markersу
//                 var focus = null;
//
//                 return L.pixiOverlay(function (utils) {
//
//                     var zoom = utils.getMap().getZoom();
//                     var triangle = utils.getContainer();
//                     var circle = new PIXI.Graphics();
//                     var renderer = utils.getRenderer();
//                     var project = utils.latLngToLayerPoint;
//                     var scale = utils.getScale();
//
//
//                     //here map was drawn
//                     if (firstDraw) {
//                         (function () {
//
//                             var geocoder = L.Control.geocoder({
//                                 defaultMarkGeocode: false
//                             })
//                                 .on('markgeocode', function(e) {
//                                     debugger;
//
//                                     var feat = findFeature(e.geocode.center);
//                                     focusFeature(feat);
//
//                                     var bbox = e.geocode.bbox;
//                                     var poly = L.polygon([
//                                         bbox.getSouthEast(),
//                                         bbox.getNorthEast(),
//                                         bbox.getNorthWest(),
//                                         bbox.getSouthWest()
//                                     ]);
//                                     map.fitBounds(poly.getBounds());
//                                 })
//                                 .addTo(map);
//
//                             var totalData = markers.features.map(function (dd) {
//                                 if (dd.geometry.coordinates.length <= 1) {
//                                     var coordObj = {
//                                         "data": dd.geometry.coordinates[0].map(function (d) {
//                                             return d.map(function (amb) {
//                                                 return project(amb)
//                                             })
//                                         }), 'status': dd.properties.status, 'koatuu': dd.properties.koatuu, 'internetInfo': dd.properties.internetInfo
//                                     };
//                                     return coordObj
//                                 }
//                                 else {
//                                     var coordObj = {
//                                         data: dd.geometry.coordinates.map(function (polygon) {
//                                             return polygon[0].map(function (p) {
//                                                 return project(p)
//                                             })
//                                         }), 'status': dd.properties.status, 'koatuu': dd.properties.koatuu, 'internetInfo': dd.properties.internetInfo
//                                     };
//                                     return coordObj
//                                 }
//                             });
//
//                             markers.features.forEach(function (dd) {
//                                 if (dd.geometry.coordinates.length <= 1) {
//                                     dd.geometry.coordinates[0].forEach(function (d, index, array) {
//                                         array[index] = d.map(function (amb) {
//                                             return project(amb)
//                                         })
//                                     })
//                                 }
//                                 else {
//                                     dd.geometry.coordinates.forEach(function (polygon, index, array) {
//                                         array[index] = polygon[0].map(function (p) {
//                                             return project(p)
//                                         })
//                                     })
//                                 }
//                             });
//
//
//                             var tree = rbush();
//
//                             // Не працювала правильно. Для визначення полігону.
//                             function containsPoint(polygon, p) {
//                                 var inside = false,
//                                     part, p1, p2, i, j, k, len, len2;
//                                 // ray casting algorithm for detecting if point is in polygon
//                                 for (i = 0, len = polygon.length; i < len; i++) {
//                                     part = polygon[i];
//
//                                     for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
//                                         p1 = part[j];
//                                         p2 = part[k];
//
//                                         if (((p1[1] > p.y) !== (p2[1] > p.y)) && (p.x < (p2[0] - p1[0]) * (p.y - p1[1]) / (p2[1] - p1[1]) + p1[0])) {
//                                             inside = !inside;
//                                         }
//                                     }
//                                 }
//                                 return inside;
//                             }
//
//
//
//                             totalData.forEach(function (feature, index) {
//                                 var bounds;
//                                 if (feature.data.length == 1) {
//                                     bounds = L.bounds(L.bounds(feature.data[0]));
//
//                                     tree.insert({
//                                         minX: bounds.min.x,
//                                         minY: bounds.min.y,
//                                         maxX: bounds.max.x,
//                                         maxY: bounds.max.y,
//                                         feature: feature
//                                     });
//
//
//                                 }
//                                 else {
//                                     feature.data.forEach(function (point) {
//                                         bounds = L.bounds(L.bounds(point));
//                                         // bounds = L.bounds(point);
//                                         tree.insert({
//                                             minX: bounds.min.x,
//                                             minY: bounds.min.y,
//                                             maxX: bounds.max.x,
//                                             maxY: bounds.max.y,
//                                             feature: feature
//                                         });
//
//
//                                     });
//                                 }
//
//                             });
//
//
//                             totalData = null;
//
//
//                             // triangle.addChild(circle);
//
//
//                             // Here I draw polygons
//                             markers.features.forEach(function (projectedPolygon) {
//
//
//                                 var color, alpha;
//                                 if (projectedPolygon.properties.internetInfo.length == 1) {
//                                     // if (projectedPolygon.properties.internetInfo[0].optical_fiber_connection == 'Так') {
//                                     //     triangle.lineStyle(0.5 / scale, 0x4ae002, 1);
//                                     // }
//                                     // else {
//                                     //     triangle.lineStyle(0.5 / scale, 0x4ae002, 0);
//                                     // }
//
//                                     // alpha = 0.6;
//
//                                     var speedNumber = +projectedPolygon.properties.internetInfo[0].household_int_speed;
//
//                                     var speedConverted =  (Math.round(speedNumber) > totalMaxSpeed ? totalMaxSpeed : Math.round(speedNumber));
//                                     var rgbColorNumber = speedLogScale(speedConverted + 1);
//                                     var rgbColor = speedColorScale(rgbColorNumber);
//
//
//                                     var intermediateColor = rgb2hex(rgbColor);
//                                     color = intermediateColor.replace('#', '0x')
//
//                                 }
//                                 else {
//                                     // triangle.lineStyle(0.5 / scale, 0x4ae002, 0);
//                                     color = 0xd3d3d3;
//                                     alpha = 0.3;
//                                 }
//
//
//                                 if (projectedPolygon.geometry.coordinates.length <= 1) {
//
//                                     // triangle.lineStyle( 0x3388ff, 1);
//                                     triangle.beginFill(color, alpha);
//                                     projectedPolygon.geometry.coordinates[0][0].forEach(function (coords, index) {
//                                         if (index == 0) triangle.moveTo(coords.x, coords.y);
//                                         else triangle.lineTo(coords.x, coords.y);
//                                     });
//
//                                     triangle.endFill();
//
//                                     // var boundPolygon = L.bounds(projectedPolygon.geometry.coordinates[0][0].map(function(d) {return [d.x,d.y]}));
//                                     // var center = [boundPolygon.max.x + boundPolygon.min.x/2,boundPolygon.max.y + boundPolygon.min.y/2];
//                                     // var radius = Math.hypot(boundPolygon.max.x - boundPolygon.max.x, boundPolygon.max.y - boundPolygon.max.y)/2;
//
//
//                                     (function () {
//                                         "use strict";
//
//                                         function Point(x, y) {
//                                             this.x = x;
//                                             this.y = y;
//                                         }
//
//                                         function Region(points) {
//                                             this.points = points || [];
//                                             this.length = points.length;
//                                         }
//
//                                         Region.prototype.area = function () {
//                                             var area = 0,
//                                                 i,
//                                                 j,
//                                                 point1,
//                                                 point2;
//
//                                             for (i = 0, j = this.length - 1; i < this.length; j=i,i++) {
//                                                 point1 = this.points[i];
//                                                 point2 = this.points[j];
//                                                 area += point1.x * point2.y;
//                                                 area -= point1.y * point2.x;
//                                             }
//                                             area /= 2;
//
//                                             return area;
//                                         };
//
//                                         Region.prototype.centroid = function () {
//                                             var x = 0,
//                                                 y = 0,
//                                                 i,
//                                                 j,
//                                                 f,
//                                                 point1,
//                                                 point2;
//
//                                             for (i = 0, j = this.length - 1; i < this.length; j=i,i++) {
//                                                 point1 = this.points[i];
//                                                 point2 = this.points[j];
//                                                 f = point1.x * point2.y - point2.x * point1.y;
//                                                 x += (point1.x + point2.x) * f;
//                                                 y += (point1.y + point2.y) * f;
//                                             }
//
//                                             f = this.area() * 6;
//
//                                             return new Point(x / f, y / f);
//                                         };
//
//
//                                         // console.log(region.centroid());
//
//                                         var boundPolygon = L.bounds(projectedPolygon.geometry.coordinates[0][0].map(function(d) {return [d.x,d.y]}));
//                                         // var center = [boundPolygon.max.x + boundPolygon.min.x/2,boundPolygon.max.y + boundPolygon.min.y/2];
//                                         var radius = Math.hypot(boundPolygon.max.x - boundPolygon.min.x, boundPolygon.max.y - boundPolygon.min.y) * scale;
//
//                                         var region = new Region(projectedPolygon.geometry.coordinates[0][0]);
//
//                                         var center = region.centroid();
//
//                                         if (projectedPolygon.properties.internetInfo.length == 1 && projectedPolygon.properties.internetInfo[0].optical_fiber_connection == 'Так') {
//                                             triangle.beginFill(0xff00ff, 1);
//                                             // var center = {x: 108126.21000304745, y: 61788.73347298092};
//                                             triangle.drawCircle(center.x, center.y, 2);
//                                             triangle.endFill();
//                                         }
//
//                                     }());
//
//
//                                     // triangle.beginFill(0xff3232, 1);
//                                     // // var center = {x: 108126.21000304745, y: 61788.73347298092};
//                                     // triangle.drawCircle(center[0], center[1], 20);
//                                     // triangle.endFill();
//                                     //
//                                     // triangle.addChild(circle)
//
//
//                                 }
//                                 else {
//                                     projectedPolygon.geometry.coordinates.forEach(function (pol) {
//                                         // // triangle.lineStyle( 0x3388ff, 1);
//                                         // triangle.beginFill(color, alpha);
//                                         pol.forEach(function (coords, index) {
//                                             // triangle.clear();
//                                             // // triangle.lineStyle( 0x3388ff, 1);
//                                             triangle.beginFill(color, alpha);
//
//                                             if (index == 0) triangle.moveTo(coords.x, coords.y);
//                                             else triangle.lineTo(coords.x, coords.y);
//                                             triangle.endFill();
//                                         });
//                                     })
//
//                                 }
//
//                             });
//                             markers = null;
//
//                             function findFeature(latlng) {
//                                 var point = project(latlng);
//                                 // alert(point.x+ " " +point.y);
//                                 var features = tree.search({
//                                     minX: point.x,
//                                     minY: point.y,
//                                     maxX: point.x,
//                                     maxY: point.y
//                                 });
//
//
//
//                                 // var features = tree.search({
//                                 //         minX: point.x,
//                                 //         minY: point.y,
//                                 //         maxX: point.x,
//                                 //         maxY: point.y
//                                 //     }).map((i) => items[i]);
//
//
//
//                                 //working here !!!!!!!!!!!!!
//                                 //Потрібно змінити об'єкти на списки і після цього
//                                 // можна користуватися функцією для точного визначення полігона
//
//                                 features.forEach(function(d) {
//                                     d.feature.data[0].forEach(function(d, i, arr) {
//                                         arr[i] = Object.values(d);
//                                     })
//                                 });
//
//
//                                 var checker;
//                                 features.forEach(function (d) {
//                                     if (containsPoint(d.feature.data, point)){
//                                         checker = true;
//                                         features = [d];
//                                     }
//                                 });
//
//                                 if (checker) {
//                                     return features;
//                                 }
//
//                             }
//
//                             function focusFeature(feat) {
//                                 if (focus) focus.removeFrom(utils.getMap());
//                                 if (feat.length == 1) {
//                                     var geojson = {
//                                         'type': 'Feature', 'geometry': {
//                                             'type': 'MultiPolygon', 'coordinates': [feat[0].feature.data]
//                                         }, 'properties': {}
//                                     };
//                                     focus = L.geoJSON(geojson, {
//                                         coordsToLatLng: utils.layerPointToLatLng,
//                                         style: function (feature) {
//                                             return {
//                                                 fillColor: '#FFD700',
//                                                 fillOpacity: 0.5,
//                                                 stroke: true,
//                                                 color: '#FFD700'
//                                             };
//                                         },
//                                         interactive: false
//                                     });
//
//                                     // chartCode.func(feat);
//
//                                     smallChartBarcode(map.getBounds(), feat);
//                                     focus.addTo(utils.getMap());
// //
//                                 } else {
//                                     focus = null;
// //										L.DomUtil.addClass(legend, 'hide');
//                                 }
//                             }
//
//                             utils.getMap().on('click', function (e) {
//                                 var feat = findFeature(e.latlng);
//                                 focusFeature(feat);
//                             });
//
//                             // старий і повільний код графіка
//
//                             // function smallChartBarcode(feat, selection) {
//                             //
//                             //     getJSON('data/broadband.json', function (data) {
//                             //         data.forEach(function (d) {
//                             //             if (selection != null) {
//                             //                 d3.selectAll('#histo .tableRow *').remove();
//                             //                 selectedKOATUU = data.filter(function (d) {
//                             //                     return d.koatuu == +selection.koatuu
//                             //                 })[0];
//                             //             }
//                             //             else {
//                             //                 d3.selectAll('#histo .tableRow *').remove();
//                             //                 // selectedKOATUU = null;
//                             //             }
//                             //         });
//                             //
//                             //         var boundCoordinates = [[project(Object.values(feat)[0])], [project(Object.values(feat)[1])]];
//                             //         var boundCities = tree.search({
//                             //             minX: boundCoordinates[0][0].x,
//                             //             minY: boundCoordinates[1][0].y,
//                             //             maxX: boundCoordinates[1][0].x,
//                             //             maxY: boundCoordinates[0][0].y
//                             //         });
//                             //
//                             //         var boundKOATUU = boundCities.map(function (d) {
//                             //             return d.feature.koatuu
//                             //         });
//                             //
//                             //         var dataFiltered = data.filter(f => boundKOATUU.includes(f.koatuu));
//                             //
//                             //         var margin = {top: 1, right: 1, bottom: 1, left: 1},
//                             //             width = 150 - margin.left - margin.right,
//                             //             height = 20 - margin.top - margin.bottom;
//                             //
//                             //         makeChart(dataFiltered, margin, width, height, selectedKOATUU, 'household_int_speed');
//                             //         makeChart(dataFiltered, margin, width, height, selectedKOATUU, 'edu_int_speed');
//                             //         makeChart(dataFiltered, margin, width, height, selectedKOATUU, 'health_int_speed');
//                             //         makeChart(dataFiltered, margin, width, height, selectedKOATUU, 'culture_int_speed');
//                             //     });
//                             // }
//
//
//                             //поточний код, потрібно доробити
//                             function smallChartBarcode(areaBounds, selectedCity) {
//                                 var boundCoordinates = [[project(Object.values(areaBounds)[0])], [project(Object.values(areaBounds)[1])]];
//                                 var boundCities = tree.search({
//                                     minX: boundCoordinates[0][0].x,
//                                     minY: boundCoordinates[1][0].y,
//                                     maxX: boundCoordinates[1][0].x,
//                                     maxY: boundCoordinates[0][0].y
//                                 });
//
//                                 // var boundCities = tree.search({
//                                 //         minX: boundCoordinates[0][0].x,
//                                 //         minY: boundCoordinates[1][0].y,
//                                 //         maxX: boundCoordinates[1][0].x,
//                                 //         maxY: boundCoordinates[0][0].y
//                                 //     }).map((i) => items[i]);
//
//                                 var boundCitiesData = boundCities.map(function(d) {return d.feature.internetInfo})
//                                     .filter(function(d) {return d.length > 0})
//                                     .map(function(d) {if (d.length > 1)  {
//                                         return d[0];
//                                     }
//                                     else {
//                                         return d[0];
//                                     }
//
//                                     });
//
//
//                                 // boundCitiesData = boundCities.map(function(d) {return d.feature.internetInfo});
//                                 boundCities = null;
//
//                                 if (selectedCity != null) {
//                                     d3.selectAll('#histo .tableRow *').remove();
//                                     // d3.select('div.cityName').remove();
//                                     selectedCityData = selectedCity[0].feature.internetInfo;
//                                 }
//                                 else {
//                                     d3.selectAll('#histo .tableRow *').remove();
//                                     // selectedKOATUU = null;
//                                     // selectedCityData = []
//                                 }
//
//
//                                 var margin = {top: 40, right: 90, bottom: 20, left: 70},
//                                     width = 450 - margin.left - margin.right,
//                                     height = 95 - margin.top - margin.bottom;
//
//                                 makeChart(boundCitiesData, margin, width, height, selectedCityData, 'household_int_speed');
//
//
//                                 var swoopy = swoopyArrow()
//                                     .angle(Math.PI/2)
//                                     .x(function(d) { return d[0]; })
//                                     .y(function(d) { return d[1]; });
//
//                                 var tipsG = d3.select('div.tableRow.first svg').append("g")
//                                     .attr("class" ,"swoopy-tooltip")
//                                     .attr("transform", "translate(" + 10 + "," + -10 + ")");
//
//                                 tipsG.append("text")
//                                     .attr('y', 25)
//                                     .attr('x', 35)
//                                     .attr('text-anchor', "end")
//                                     .text('Мінімальна');
//
//
//                                 tipsG.append("text")
//                                     .attr('y', 35)
//                                     .attr('x', 35)
//                                     .attr('text-anchor', "end")
//                                     .text('швидкість');
//
//                                 tipsG.append("text")
//                                     .attr('y', 45)
//                                     .attr('x', 35)
//                                     .attr('text-anchor', "end")
//                                     .text('інтернету');
//
//
//                                 tipsG.append("text")
//                                     .attr('y', 55)
//                                     .attr('x', 35)
//                                     .attr('text-anchor', "end")
//                                     .text('по Україні');
//
//
//                                 tipsG.append("path")
//                                     .attr('marker-end', 'url(#arrowhead)')
//                                     .datum([[40, 85],[20, 65]])
//                                     .attr("d", swoopy);
//
//                                 d3.select('div.tableRow.first svg').append('g').html('<marker id="arrowhead" viewBox="-10 -10 20 20" refX="0" refY="0" markerWidth="10" markerHeight="10" stroke-width="1" orient="auto"><polyline stroke-linejoin="bevel" points="-6.75,-6.75 0,0 -6.75,6.75"></polyline></marker>')
//
//
//                                 var swoopy2 = swoopyArrow()
//                                     .angle(Math.PI/2)
//                                     .clockwise(false)
//                                     .x(function(d) { return d[0]; })
//                                     .y(function(d) { return d[1]; });
//
//                                 var tipsB = d3.select('div.tableRow.first svg').append("g")
//                                     .attr("class" ,"swoopy-tooltip")
//                                     .attr("transform", "translate(" + 390 + "," + -10 + ")");
//
//                                 tipsB.append("text")
//                                     .attr('y', 25)
//                                     .attr('x', 35)
//                                     .attr('text-anchor', "end")
//                                     .text('Максимальна');
//
//
//                                 tipsB.append("text")
//                                     .attr('y', 35)
//                                     .attr('x', 35)
//                                     .attr('text-anchor', "end")
//                                     .text('швидкість');
//
//                                 tipsB.append("text")
//                                     .attr('y', 45)
//                                     .attr('x', 35)
//                                     .attr('text-anchor', "end")
//                                     .text('інтернету');
//
//
//                                 tipsB.append("text")
//                                     .attr('y', 55)
//                                     .attr('x', 35)
//                                     .attr('text-anchor', "end")
//                                     .text('по Україні');
//
//
//                                 tipsB.append("path")
//                                     .attr('marker-end', 'url(#arrowhead)')
//                                     .datum([[0, 80],[20, 60]])
//                                     // .datum([[0, 80],[20, 60]])
//                                     .attr("d", swoopy2);
//
//
//                                 margin = {top: 5, right: 90, bottom: 10, left: 70},
//                                     width = 410 - margin.left - margin.right,
//                                     height = 70 - margin.top - margin.bottom;
//
//
//                                 makeChart(boundCitiesData, margin, width, height, selectedCityData, 'edu_int_speed');
//                                 makeChart(boundCitiesData, margin, width, height, selectedCityData, 'health_int_speed');
//                                 makeChart(boundCitiesData, margin, width, height, selectedCityData, 'culture_int_speed');
//                                 makeChart(boundCitiesData, margin, width, height, selectedCityData, 'munic_int_speed');
//
//                                 d3.select('div.cityName p').text(
//                                     selectedCityData == undefined ? "Оберіть місто" : selectedCityData[0].ato_name
//                                 );
//
//
//
//                                 if (selectedCityData != undefined && selectedCityData[0].optical_fiber_connection == 'Так') {
//                                     d3.select('div.cityName button.btn').style('opacity', 1);
//                                 }
//                                 else {
//                                     d3.select('div.cityName button.btn').style('opacity', 0);
//                                 }
//
//
//
//                             }
//
//                             smallChartBarcode(map.getBounds(), null);
//                             map.on('moveend', function () {
//                                 smallChartBarcode(map.getBounds(), null);
//                             });
//
//
//                             totalData = null;
//                         })();
//                     }
//                     firstDraw = false;
//                     prevZoom = zoom;
//
//
//                     window.triangle = triangle;
//                     renderer.render(triangle);
//                     // renderer.render(circle);
//
//
//                 }, pixiContainer, {
//                     doubleBuffering: doubleBuffering,
//                     autoPreventDefault: false
//                 });
//             })();
//             pixiOverlay2.addTo(map);



            // window.pixiOverlay2 = pixiOverlay2;


        var gl2 = L.mapboxGL({
            accessToken: 'pk.eyJ1IjoiZHJpbWFjdXMxODIiLCJhIjoiWGQ5TFJuayJ9.6sQHpjf_UDLXtEsz8MnjXw',
            maxZoom: 19,
            // style: 'data/internet.json',
            style: 'data/positron.json',
            pane: 'overlayPane'
        }).addTo(map);



    });
    });
});
