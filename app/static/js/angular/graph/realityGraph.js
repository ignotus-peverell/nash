/* global angular, d3 */

'use strict';

var nash = angular.module('nash');

nash.directive('realityGraph', [
    'graphComponents',
    function(graphComponents) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/partials/graph/graph.html',
        scope:{
            graph: '=',
            graphState: '='
        },
        link: function(scope, element, attrs) {

            var width = 800;
            var height = 700;


            console.log('Reality Graph Directive.');
            console.log(scope, element);

            var bkgd_menu = [
                {
                    title: 'Save',
                    action: function(elm, d, i) {
                        //save();
                    }
                },
                {
                    title: 'New node',
                    action: function(elm, d, i) {
                        //new_node();
                    }
                },
                {
                    title: 'Edit mode',
                    action: function(elm, d, i) {
                        //mode_arrows();
                    }
                },
                {
                    title: 'Move mode',
                    action: function(elm, d, i) {
                        //mode_move();
                    }
                },
            ]

            var graphEl = element[0];

            var rGraph = d3.select(graphEl)
                .append('svg:svg')
                .attr('width', width)
                .attr('height', height)
                .style('border', '1px solid black')
                .attr('pointer-events', 'all');

            graphComponents.appendMarkerDef(rGraph, 'arrowhead-red');
            graphComponents.appendMarkerDef(rGraph, 'arrowhead-orange');
            graphComponents.appendMarkerDef(rGraph, 'arrowhead-green');
            graphComponents.appendMarkerDef(rGraph, 'arrowhead-black');

            graphComponents.appendMarkerDef(rGraph, 'arrowhead-yellow')
                .attr('stroke-width', 0.1)
                .attr('stroke-width', 0.1);

            // var mousemove function() {
            //     if (scope.graphState.editMode === 'arrow') {
            //         if (!scope.graphState.mousedown_node || scope.graphState.context_open) {
            //             return;
            //         }

            //         console.log('mousemove', scope.graphState.context_open);

            //         // update drag line
            //         drag_line
            //             .attr('x1', scope.graphState.mousedown_node.x)
            //             .attr('y1', scope.graphState.mousedown_node.y)
            //             .attr('x2', d3.mouse(this)[0])
            //             .attr('y2', d3.mouse(this)[1]);

            //     } else if (scope.graphState.editMode === 'move') {
            //         if (!scope.graphState.mousedown_node || scope.graphState.context_open) {
            //             return;
            //         }
            //         scope.graphState.mousedown_node.x = d3.mouse(this)[0];
            //         scope.graphState.mousedown_node.y = d3.mouse(this)[1];

            //         // update drag line
            //         drag_line
            //             .attr('x1', scope.graphState.mousedown_node.x)
            //             .attr('y1', scope.graphState.mousedown_node.y)
            //             .attr('x2', d3.mouse(this)[0])
            //             .attr('y2', d3.mouse(this)[1]);
            //     }
            // }

            // rescale g
            var rescale = function() {
                var trans = d3.event.translate;
                var scale = d3.event.scale;

                if (!scope.graphState.mousedown_node) {

                    vis.attr('transform',
                             'translate(' + trans + ')'
                             + ' scale(' + scale + ')');
                }
            }

            var vis = rGraph
                .append('svg:g')
                // .call(d3.behavior.zoom().on('zoom', rescale))
                // .on('dblclick.zoom', null)
                // .append('svg:g');
                // .on('mousemove', mousemove)
                // .on('mousedown', mousedown)
                // .on('mouseup', mouseup);
            // // ^^^^ TODO: Handle mouseevents

            // vis.on('contextmenu', d3.contextMenu(bkgd_menu, {
            //     onOpen: function() {
            //         scope.graphState.context_open = true;
            //     },
            //     onClose: function() {
            //         setTimeout(function() {
            //             scope.graphState.context_open = false;
            //         }, 500);
            //         // reset_mouse_vars();
            //     }
            // }));

            // vis.append('svg:rect')
            //     .attr('width', width)
            //     .attr('height', height)
            //     .attr('fill', 'white');

            console.log(scope.graph.nodes);
            var tick = function() {
                console.log('FORCE TICK');
                // When this function executes, the force layout
                // calculations have concluded. The layout will
                // have set various properties in our nodes and
                // links objects that we can use to position them
                // within the SVG container.

                // First let's reposition the nodes. As the force
                // layout runs it updates the `x` and `y` properties
                // that define where the node should be centered.
                // To move the node, we set the appropriate SVG
                // attributes to their new values. Also give the
                // nodes a non-zero radius so they're visible.

                nodes
                    .attr('r', width/100)
                    .attr('cx', function(d) { return d.x; })
                    .attr('cy', function(d) { return d.y; })
                    .attr('stroke-width', function (d) { return d.locked ? 5 : 2 })
                    .attr('stroke', function (d) {
                        if (d.self_causing) {
                            if (d.self_cause_weird === '0') {
                                return '#00ff00';
                            } else if (d.self_cause_weird === '1') {
                                return '#ffff00';
                            } else if (d.self_cause_weird === '2') {
                                return '#ffb400';
                            }
                            return '#ff0000';
                        }
                        return '#000000';
                    })
                    .attr('fill', function (d) {
                        // if (d === ui_state.selected_node) {
                        //     return '#ffb400';
                        // } else
                            if (d.truth) {
                            return '#ffffff';
                        }
                        return '#999999';
                    });

                nodeLabels
                    .attr('x', function (d) { return d.x - 5; })
                    .attr('y', function (d) { return d.y + 5; })
                    .attr('fill', function (d) { return d.truth ? '#000000' : '#ffffff' })
                    .text(function (d) { return d.label; });


                // We also need to update positions of the links.
                // For those elements, the force layout sets the
                // `source` and `target` properties, specifying
                // `x` and `y` values in each case.




                edges
                    .attr('points', function (d) {
                        var endX = (2 * d.source.x + 3 * d.target.x) / 5.0;
                        var endY = (2 * d.source.y + 3 * d.target.y) / 5.0;
                        return [d.source.x,
                                d.source.y + ' ' + endX,
                                endY + ' ' +
                                d.target.x, d.target.y].join(',');
                    })
//                    .classed('reference-edge' function(d) { d.meaning === 'reference'})
//                    .classed('reference-edge' function(d) { d.meaning === 'reference'})
                    .classed('reference-edge', function(d) { d.meaning === 'reference'})
                    .attr('marker-mid', function(d) {
                        if (d.meaning === 'reference') {
                            return ''
                        } else if (d.failed_cause) {
                            if (d.cause_weird === '0') {
                                return 'url(#arrowhead-green)';
                            }
                            else if (d.cause_weird === '1') {
                                return 'url(#arrowhead-yellow)';
                            }
                            else if (d.cause_weird === '2') {
                                return 'url(#arrowhead-orange)';
                            }
                        } else if (d.failed_prevent) {
                            if (d.prevent_weird === '0') {
                                return 'url(#arrowhead-green)';
                            }
                            else if (d.prevent_weird === '1') {
                                return 'url(#arrowhead-yellow)';
                            }
                            else if (d.prevent_weird === '2') {
                                return 'url(#arrowhead-orange)';
                            }
                        }
                        return 'url(#arrowhead-black)';
                    });

            };

            // init force layout
            var force = d3.layout.force()
                .size([width, height])
                .nodes(scope.graph.nodes)
                .links(scope.graph.edges)
                .linkDistance(200)
                .charge(-1000)
                .on('tick', tick);
        //     next_id += 1;

            // line displayed when dragging new nodes
            // var drag_line = vis.append('line')
            //     .attr('class', 'drag_line')
            //     .attr('x1', 0)
            //     .attr('y1', 0)
            //     .attr('x2', 0)
            //     .attr('y2', 0);

            // // get layout properties
            // var nodes = force.nodes(),
            //     edges = force.links(),
            //     node = vis.selectAll('.node'),
            //     edge = vis.selectAll('.edge'),
            //     labels = vis.selectAll('.text');


            var edges = vis.selectAll('.edge')
                .data(scope.graph.edges)
                .enter()
                .append('polyline')
                .attr('class', 'edge');

            console.log('edges', edges);
            // Now it's the nodes turn. Each node is drawn as a circle.

            var nodes = vis.selectAll('.node')
                .data(scope.graph.nodes)
                .enter()
                .append('circle')
                .attr('class', 'node');

            var nodeLabels = vis.selectAll('.node-label')
                .data(scope.graph.nodes)
                .enter()
                .append('text')
                .attr('class', 'text')
                .attr('font-family', 'sans-serif')
                .attr('font-size', '10px');


            force.start();

            scope.$watch('graph', function() {
                tick();
            }, true);

            //     // add keyboard callback
        //     d3.select(window)
        //         .on('keydown', keydown);

        //     redraw();

            // focus on svg
            // vis.node().focus();

        //     init_ui_hooks();

        //     // scope.$watch('graph', function (newVal, oldVal) {
        //     //     rGraph.datum(newVal).call(rGraph);
        //     // });

        }
    }
}]);
