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
//
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


// const loader = new PIXI.loaders.Loader();
// loader.add('data', 'data.json');

document.addEventListener("DOMContentLoaded", function() {
    getJSON('data/data_geo_with_status.json', function (markers) {

			markers.features = _.sampleSize(markers.features, 1000);
        // markers.features = marker.fus.features.filter(function(d) {return d.properties.name === "Харків місто"} )

        //var markerTexture = resources.marker.texture;
        var map = L.map('map').setView([50.451141, 30.522684], 8);
        // L.tileLayer('//stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
        //     subdomains: 'abcd',
        //     attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
        //     minZoom: 2,
        //     maxZoom: 10
        // }).addTo(map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);


        map.attributionControl.setPosition('bottomleft');
        map.zoomControl.setPosition('bottomright');
        // map.setView([50.451141, 30.522684], 8);
        var pixiOverlay = (function () {
            var frame = null;
            var firstDraw = true;
            var prevZoom;

            var tree = rbush();


            var pixiContainer = new PIXI.Container();
            pixiContainer.interactive = true;
            pixiContainer.buttonMode = true;

            // var triangle = new PIXI.Graphics();



            // map.on('zoomend', function() {
            //     debugger;
            // });




            var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;


            markers.features.forEach(function(d) {
                if (d.geometry.coordinates.length == 1) {
                    d.geometry.coordinates[0][0].forEach(function(dd) {dd.reverse()}) }

                else
                {
                    d.geometry.coordinates.forEach(function(b) {
                        b[0].forEach(function(bb) {bb.reverse()})
                    })
                }
            });

            var mesh;
            var focus = null;

            return L.pixiOverlay(function (utils) {
//					if (frame) {
//						cancelAnimationFrame(frame);
//						frame = null;
//					}

                var zoom = utils.getMap().getZoom();
                var container = utils.getContainer();
                var renderer = utils.getRenderer();
                var project = utils.latLngToLayerPoint;
                var scale = utils.getScale();




                if (firstDraw) {
                    (function() {

                        // var treeBase = JSON.parse(JSON.stringify(markers));
                        //
                        // treeBase.features.forEach(function(d) {
                        //     if (d.geometry.coordinates.length == 1) {
                        //         d.geometry.coordinates[0][0].forEach(function(dd, i, array) {array[i] = project(dd)}) }
                        //
                        //     else
                        //     {
                        //         d.geometry.coordinates.forEach(function(b) {
                        //             b[0].forEach(function(bb, i, array) {array[i] = project(bb)})
                        //         })
                        //     }
                        // });


                        var totalData = markers.features.map(function (dd) {
                            if (dd.geometry.coordinates.length <= 1) {
                                var coordObj = {"data":dd.geometry.coordinates[0].map(function (d) {
                                    return d.map(function (amb) {
                                        return project(amb)
                                    })
                                }), 'status': dd.properties.status, 'koatuu':dd.properties.koatuu};
                                return coordObj
                            }
                            else {
                                var coordObj = {data:dd.geometry.coordinates.map(function (polygon) {
                                    return polygon[0].map(function (p) {
                                        return project(p)
                                    })
                                }) , 'status': dd.properties.status, 'koatuu':dd.properties.koatuu};
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


                        // treeBase.features.forEach(function(feature, index) {
							// 	var alpha, color;
							// 	var res = feature.properties && feature.properties.res;
							// 	if (res != undefined) {
							// 		color = nuance2color[res.nuance];
							// 		alpha = alphaScale(res.ratio || 0.5);
							// 	} else {
							// 		color = 0xffffff;
							// 		alpha = 0.8;
							// 	}
//
//                             var bounds;
//                             if (feature.geometry.type === 'Polygon') {
//                                 bounds = L.bounds(feature.geometry.coordinates[0]);
// //									drawPoly(color, alpha)(feature.geometry.coordinates);
//                             } else if (feature.geometry.type == 'MultiPolygon') {
// //									feature.geometry.coordinates.forEach(drawPoly(color, alpha));
//                                 feature.geometry.coordinates.forEach(function(poly, index) {
//                                     if (index === 0) bounds = L.bounds(poly[0]);
//                                     else {
//                                         poly[0].forEach(function(point) {
//                                             bounds.extend(point);
//                                         });
//                                     }
//                                 });
//									feature.geometry.coordinates.forEach(function(poly, index) {
//										if (index === 0)
//											bounds = L.bounds(poly[0].map(function (list) {
//											return project(list)
//										})
//										);
//										else {
//											bounds = L.bounds(poly[0].map(function (list) {
//												return project(list)
//											}));
//										}
//									});
//                             }
                        //     tree.insert({
                        //         minX: bounds.min.x,
                        //         minY: bounds.min.y,
                        //         maxX: bounds.max.x,
                        //         maxY: bounds.max.y,
                        //         feature: feature
                        //     });
                        // });

							totalData.forEach(function(feature, index) {
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
									feature.data.forEach(function(point) {
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

                        totalData = null;

                        markers.features.forEach(function (projectedPolygon) {

                            var triangle = new PIXI.Graphics();

                            var color, alpha
                                if (projectedPolygon.properties.status == "true") {
                                    // triangle.lineStyle(3 / scale, 0xffffff, 1);
                                    // triangle.beginFill(0xc20000, 1);
                                    color = 0xc20000;
                                    alpha = 0.6;

                                }
                                else {
                                    // triangle.lineStyle(3 / scale, 0xffffff, 1);
                                    // triangle.beginFill(0x0000ff, 1);
                                    color = 0x0000ff;
                                    alpha = 0.6;
                                }


                                if (projectedPolygon.geometry.coordinates[0].length <= 1) {
                                    triangle.clear();
                                    // triangle.lineStyle( 0x3388ff, 1);
                                    triangle.beginFill(color, alpha);
                                    projectedPolygon.geometry.coordinates[0][0].forEach(function(coords, index) {
                                        if (index == 0) triangle.moveTo(coords.x, coords.y);
                                        else triangle.lineTo(coords.x, coords.y);
                                    });
                                    triangle.endFill();

                                    pixiContainer.addChild(triangle);
                                }
                                else {
                                    projectedPolygon.geometry.coordinates.forEach(function (pol) {
                                        // triangle.clear();
                                        // // triangle.lineStyle( 0x3388ff, 1);
                                        // triangle.beginFill(color, alpha);
                                        pol.forEach(function(coords, index) {
                                            // triangle.clear();
                                            // // triangle.lineStyle( 0x3388ff, 1);
                                            triangle.beginFill(color, alpha);

                                            if (index == 0) triangle.moveTo(coords.x, coords.y);
                                            else triangle.lineTo(coords.x, coords.y);
                                            triangle.endFill();
                                            pixiContainer.addChild(triangle);
                                        });
                                        // triangle.endFill();
                                    })

                                }

                            // pixiContainer.addChild(triangle);
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

                            return features[0].feature

                            // for (var i = 0; i < features.length; i++) {
                            //     var feat = features[i].feature;
                            //     return feat
//									 ТУТ БУЛА ПЕРЕВІРЯЛКА, АЛЕ ВОНА ДЛЯ МЕНЕ НЕ ДУЖЕ ПОТРІБНА
//                                 if (feat.geometry.type === 'Polygon') {
//                                     if ((feat.geometry.coordinates, point)) return feat;
//                                 } else {
//                                     for (var j = 0; j < feat.geometry.coordinates.length; j++) {
//                                         var ring = feat.geometry.coordinates[j][0].map(function(d) { return d} );
// //											Хуйня відбувається тут
//                                         if (containsPoint(ring, point)) return feat;
//                                     }
//                                 }
//                             }
                        }
                        function focusFeature(feat) {
								if (focus) focus.removeFrom(utils.getMap());
                            if (feat) {
                                if (feat) {
                                    var geojson = {'type':'Feature', 'geometry':{
                                        'type': 'MultiPolygon', 'coordinates': [feat.data]
                                    }, 'properties':{}};
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

                                    chartCode.func(feat);
                                    focus.addTo(utils.getMap());
//										var dpt = feat.properties.ref.substring(0, 3);
//										getJSON('data/leg-t1/' + dpt + '/' + feat.properties.ref + feat.properties.city + '.json', function(data) {
//											var merged = barbiche('details').merge({
//												nuance2color: nuance2color,
//												getRatio: function(a, b) {return Math.round(a * 10000 / b) / 100;},
//												fill: function(str) {
//													if (str.length < 6) {
//														return (new Array(6 - str.length + 1)).join('0') + str;
//													} else return str;
//												}
//											}, data);
//											legendContent.innerHTML = '';
//											legendContent.appendChild(merged);
//											L.DomUtil.removeClass(legend, 'hide');
//										});
                                } else {
                                    focus = null;
//										L.DomUtil.addClass(legend, 'hide');
                                };
                            } else {
                                focus = null;
//									L.DomUtil.addClass(legend, 'hide');
                            }
                        }
                        utils.getMap().on('click', function(e) {
                            var feat = findFeature(e.latlng);
                            focusFeature(feat);
                        });

                        totalData = null;
                    })();
                }
                firstDraw = false;
                prevZoom = zoom;
                renderer.render(container);


            }, pixiContainer, {
                doubleBuffering: doubleBuffering,
                autoPreventDefault: false
            });
        })();
        pixiOverlay.addTo(map);
    });
});


chartCode.func("first");