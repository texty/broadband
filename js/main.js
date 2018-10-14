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


        L.Control.geocoder().addTo(map);

        var pixiOverlay = (function () {
            var frame = null;
            var firstDraw = true;
            var prevZoom;
            var selectedCityData;

            // var tree = rbush();


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
                var renderer = utils.getRenderer();
                var project = utils.latLngToLayerPoint;
                var scale = utils.getScale();


                //here map was drawn
                if (firstDraw) {
                    (function () {

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

                        // var dataLength = totalData.map(function(d) {return d.data.length}).reduce((a, b) => a + b, 0);

                        // var tree = new Flatbush(dataLength);

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

                                // tree.add(
                                //     {
                                //         minX: bounds.min.x,
                                //         minY: bounds.min.y,
                                //         maxX: bounds.max.x,
                                //         maxY: bounds.max.y,
                                //         feature: feature
                                //     }
                                // );
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

                                    // tree.add(
                                    //     {
                                    //         minX: bounds.min.x,
                                    //         minY: bounds.min.y,
                                    //         maxX: bounds.max.x,
                                    //         maxY: bounds.max.y,
                                    //         feature: feature
                                    //     }
                                    // );

                                });
                            }

                        });

                        // tree.finish();

                        totalData = null;


                        // Here I draw polygons
                        markers.features.forEach(function (projectedPolygon) {
                            if (projectedPolygon.properties.koatuu == 8000000000) {
                                debugger;
                            }

                            var color, alpha
                            if (projectedPolygon.properties.internetInfo.length == 1) {
                                // triangle.lineStyle(3 / scale, 0xffffff, 1);
                                // triangle.begFinFill(0xc20000, 1);
                                color = 0xc20000;
                                alpha = 0.6;

                            }
                            else {
                                // triangle.lineStyle(3 / scale, 0xffffff, 1);
                                // triangle.beginFill(0x0000ff, 1);
                                color = 0xd3d3d3;
                                alpha = 0.6;
                            }


                            if (projectedPolygon.geometry.coordinates.length <= 1) {

                                // triangle.lineStyle( 0x3388ff, 1);
                                triangle.beginFill(color, alpha);
                                projectedPolygon.geometry.coordinates[0][0].forEach(function (coords, index) {
                                    if (index == 0) triangle.moveTo(coords.x, coords.y);
                                    else triangle.lineTo(coords.x, coords.y);
                                });
                                triangle.endFill();

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
                        markers = null;

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
                            if (feat[0].length != 1) {
                                var geojson = {
                                    'type': 'Feature', 'geometry': {
                                        'type': 'MultiPolygon', 'coordinates': [feat[0].feature.data]
                                    }, 'properties': {}
                                };
                                focus = L.geoJSON(geojson, {
                                    coordsToLatLng: utils.layerPointToLatLng,
                                    style: function (feature) {
                                        return {
                                            fillColor: ' #008000',
                                            fillOpacity: 0.5,
                                            stroke: true
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


                            boundCitiesData = boundCities.map(function(d) {return d.feature.internetInfo});
                            boundCities = null;

                            if (selectedCity != null) {
                                d3.selectAll('#histo .tableRow *').remove();
                                selectedCityData = selectedCity[0].feature.internetInfo;
                            }
                            else {
                                d3.selectAll('#histo .tableRow *').remove();
                                // selectedKOATUU = null;
                                // selectedCityData = []
                            }


                            var margin = {top: 1, right: 1, bottom: 1, left: 1},
                                width = 150 - margin.left - margin.right,
                                height = 20 - margin.top - margin.bottom;

                            makeChart(boundCitiesData, margin, width, height, selectedCityData, 'household_int_speed');
                            makeChart(boundCitiesData, margin, width, height, selectedCityData, 'edu_int_speed');
                            makeChart(boundCitiesData, margin, width, height, selectedCityData, 'health_int_speed');
                            makeChart(boundCitiesData, margin, width, height, selectedCityData, 'culture_int_speed');

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


        var gl2 = L.mapboxGL({
            accessToken: 'pk.eyJ1IjoiZHJpbWFjdXMxODIiLCJhIjoiWGQ5TFJuayJ9.6sQHpjf_UDLXtEsz8MnjXw',
            maxZoom: 19,
            // style: 'data/internet.json',
            style: 'data/labels.json',
            pane: 'overlayPane'
        }).addTo(map);


    });
    });
});
