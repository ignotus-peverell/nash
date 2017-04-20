/* global angular, d3 */

'use strict';

var nash = angular.module('nash');

nash.directive('realityGraph', [
    '$timeout',
    'graphComponents',
    function($timeout, graphComponents) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/partials/graph/graph.html',
        scope:{
            graph: '=',
            graphState: '=',
        },
        link: function(scope, element, attrs) {
            console.log('Reality Graph Directive.');

            var width = 800;
            var height = 700;
            var force = d3.layout.force()
                .size([width, height])
                .linkDistance(200)
                .charge(-1000);
            var dragLine, nodes, edges, nodeLabels;

            var edge_menu = [
                {title: function(d) {
                    return d.label + " (edit)";
                },
                 action: function(elm, d, i) {
                     $("#edge-label").focus();
                 }
                },
                {title: function(d) {
                    return d.detailed + " (edit)";
                },
                 action: function(elm, d, i) {
                     $("#detailed-description-edge").focus();
                 }
                },
                {title: 'Delete',
                 action: function(elm, d, i) {
                     delete_edge(elm);
                 }
                },
                {title: 'Reverse arrow',
                 action: function(elm, d, i) {
                     var tmp = d.source;
                     d.source = d.target;
                     d.target = tmp;
                 }
                },
                {title: 'Feels like a reference to',
                 action: function(elm, d, i) {
                     d.meaning = 'reference'
                 }
                },
                {title: 'Very likely to cause',
                 action: function(elm, d, i) {
                     d.meaning = 'cause'
                     d.cause_weird = '3';
                 }
                },
                {title: 'Fairly likely to cause',
                 action: function(elm, d, i) {
                     d.meaning = 'cause'
                     d.cause_weird = '2';
                 }
                },
                {title: 'Somewhat likely to cause',
                 action: function(elm, d, i) {
                     d.meaning = 'cause'
                     d.cause_weird = '1';
                 }
                },
                {title: 'Not at all likely to cause',
                 action: function(elm, d, i) {
                     d.meaning = 'cause'
                     d.cause_weird = '0';
                 }
                },
                {title: 'Very likely to prevent',
                 action: function(elm, d, i) {
                     d.meaning = 'prevent'
                     d.prevent_weird = '3';
                 }
                },
                {title: 'Fairly likely to prevent',
                 action: function(elm, d, i) {
                     d.meaning = 'prevent'
                     d.prevent_weird = '2';
                 }
                },
                {title: 'Somewhat likely to prevent',
                 action: function(elm, d, i) {
                     d.meaning = 'prevent'
                     d.prevent_weird = '1';
                 }
                },
                {title: 'Not at all likely to prevent',
                 action: function(elm, d, i) {
                     d.meaning = 'prevent'
                     d.prevent_weird = '0';
                 }
                },
            ];


            var node_menu = [
                {title: function(n) {
                    return n.label + " (edit)";
                },
                 action: function(elm, d, i) {
                     $("#node-label").focus();
                 }
                },
                {title: function(n) {
                    return n.detailed + " (edit)";
                },
                 action: function(elm, d, i) {
                     $("#detailed-description-node").focus();
                 }
                },
                {title: 'Delete',
                 action: function(elm, d, i) {
                     delete_node(elm);
                 }
                },
                {title: function(n) {
                    if (n.truth) {
                        return 'Make false';
                    } else {
                        return 'Make true';
                    }
                },
                 action: function(elm, d, i) {
                     d.truth = !d.truth;
                 }
                },
                {title: 'Very likely to happen for no reason',
                 action: function(elm, d, i) {
                     d.self_cause_weird = '0';
                 }
                },
                {title: 'Fairly likely to happen for no reason',
                 action: function(elm, d, i) {
                     d.self_cause_weird = '1';
                 }
                },
                {title: 'Somewhat likely to happen for no reason',
                 action: function(elm, d, i) {
                     d.self_cause_weird = '2';
                 }
                },
                {title: 'Not at all likely to happen for no reason',
                 action: function(elm, d, i) {
                     d.self_cause_weird = '3';
                 }
                },
            ]

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
                        //mode_edits();
                    }
                },
                {
                    title: 'Move mode',
                    action: function(elm, d, i) {
                        //mode_move();
                    }
                },
            ]

            var contextMenuHandlers = {
                onOpen: function() {
                    scope.$apply(scope.graphState.events.openContextMenu);
                },
                onClose: function() {
                    $timeout(scope.graphState.events.closeContextMenu, 500);
                    // reset_mouse_vars();
                    // TODO ^^^
                }
            };

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

            var mousemove = function() {
                if (scope.graphState.edit_mode === 'edit') {
                    if (!scope.graphState.mousedown_node || scope.graphState.context_open) {
                        return;
                    }

                    // update drag line
                    dragLine
                        .attr('x1', scope.graphState.mousedown_node.x)
                        .attr('y1', scope.graphState.mousedown_node.y)
                        .attr('x2', d3.mouse(this)[0])
                        .attr('y2', d3.mouse(this)[1]);

                } else if (scope.graphState.edit_mode === 'move') {
                    if (!scope.graphState.mousedown_node || scope.graphState.context_open) {
                        return;
                    }
                    scope.graphState.mousedown_node.x = d3.mouse(this)[0];
                    scope.graphState.mousedown_node.y = d3.mouse(this)[1];

                    // update drag line
                    dragLine
                        .attr('x1', scope.graphState.mousedown_node.x)
                        .attr('y1', scope.graphState.mousedown_node.y)
                        .attr('x2', d3.mouse(this)[0])
                        .attr('y2', d3.mouse(this)[1]);
                }
            };

            var mousedown = function() {
                if (scope.graphState.edit_mode === 'edit') {
                    if (!scope.graphState.mousedown_node && !scope.graphState.mousedown_edge) {
                        // allow panning if nothing is selected
                        vis.call(d3.behavior.zoom().on('zoom', rescale));
                        return;
                    }
                }
            };

            var mouseup = function() {
                if (scope.graphState.mode === 'edit') {
                    if (scope.graphState.mousedown_node && !scope.graphState.context_open) {

                        // hide drag line
                        dragLine
                            .attr('class', 'drag-line-hidden');

                        // if (!scope.graphState.mouseup_node) {
                        //     // add node
                        //     var point = d3.mouse(this),
                        //         node = {x: point[0], y: point[1], id: next_id,
                        //                 label: 'label', detailed: next_id};
                        //     next_id += 1;
                        //     nodes.push(node);

                        //     // select new node
                        //     select_node(node);

                        //     // add edge to mousedown node
                        //     edges.push({source: scope.graphState.mousedown_node,
                        //                 target: node, detailed: ''});
                        // }

                    }
                } else if (scope.graphState.mode === 'move') {
                    console.log('move mouseup');
                }
                // clear mouse event vars
                //reset_mouse_vars();
            };

            // rescale g
            var rescale = function() {
                var trans = d3.event.translate;
                var scale = d3.event.scale;
                if (!scope.graphState.mousedown_node) {
                    vis.attr('transform',
                             'translate(' + trans + ')'
                             + ' scale(' + scale + ')');
                }
            };

            var vis = rGraph
                .append('svg:g')
                .call(d3.behavior.zoom().on('zoom', rescale))
                .on('dblclick.zoom', null)
                .append('svg:g')
                .on('mousemove', mousemove)
                .on('mousedown', mousedown)
                .on('mouseup', mouseup)
                .on('contextmenu', d3.contextMenu(bkgd_menu, contextMenuHandlers));

            vis.append('svg:rect')
                .attr('width', width)
                .attr('height', height)
                .attr('fill', 'white');

            var tick = function() {
                console.log('tick tock');
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
                    })
                    .on('mousedown', function(d) {
                        scope.$apply(function() {
                            if (scope.graphState.context_open) {
                                return;
                            }

                            scope.graphState.mousedown_node = d;

                            // disable zoom
                            vis.call(d3.behavior.zoom().on('zoom', null));

                            if (scope.graphState.mousedown_node === scope.graphState.selected_node) {
                                scope.graphState.events.selectNode(null);
                            } else {
                                scope.graphState.events.selectNode(scope.graphState.mousedown_node);
                            }

                            // reposition drag line
                            dragLine
                                .attr('class', 'edge')
                                .attr('x1', scope.graphState.mousedown_node.x)
                                .attr('y1', scope.graphState.mousedown_node.y)
                                .attr('x2', scope.graphState.mousedown_node.x)
                                .attr('y2', scope.graphState.mousedown_node.y);
                        });
                    })
                    .on('mouseup',
                        function (d) {
                            scope.$apply(function() {
                                if (scope.graphState.mousedown_node) {
                                    scope.graphState.mouseup_node = d;
                                    if (scope.graphState.mouseup_node
                                        === scope.graphState.mousedown_node) {
                                        //reset_mouse_vars();
                                        return;
                                    }

                                    // add edge
                                    var sourceNode = scope.graphState.mousedown_node;
                                    var targetNode = scope.graphState.mouseup_node;
                                    scope.graphState.operations.addEdge(sourceNode, targetNode, scope.graph.edges);

                                    // enable zoom
                                    vis.call(d3.behavior.zoom().on('zoom', rescale));
                                }
                            });
                        })
                    .transition()
                    .duration(750)
                    .ease("elastic")
                    .attr("r", 40);


                nodeLabels
                    .attr('x', function (d) { return d.label ? d.x - 3 * d.label.length : d.x; })
                    .attr('y', function (d) { return d.y + 5; });

                // We also need to update positions of the edges.
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

            };

            var enterEdges = function(d) {
                d
                    .enter()
                    .append('polyline')
                    .attr('class', 'edge')
                    .on('mousedown', function(d) {
                        scope.$apply(function(){
                            scope.graphState.events.mousedownEdge(d);
                        });
                    })
                    .classed("edge-selected", function (d) {
                        return d === scope.graphState.selected_edge;
                    })
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
                    })
                    .on("contextmenu", d3.contextMenu(edge_menu, contextMenuHandlers));

            };

            var enterNodes = function(d) {
                d
                    .enter()
                    .append('circle')
                    .attr('cx', function(d) { return d.x; })
                    .attr('cy', function(d) { return d.y; })
                    .attr('r', 30)
                    .attr('class', 'node')
                    .on('contextmenu', d3.contextMenu(node_menu,  contextMenuHandlers));
            };

            var enterNodeLabels = function(d) {
                d
                    .enter()
                    .append('text')
                    .attr('class', 'text')
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', '10px')
                    .attr('fill', function (d) { return d.truth ? '#000000' : '#ffffff' })
                    .text(function (d) { return d.label; });
            };

            var render = function() {
                // init force layout
                force
                    .nodes(scope.graph.nodes)
                    .links(scope.graph.edges)
                    .on('tick', tick);

                //     next_id += 1;

                // line displayed when dragging new nodes
                dragLine = vis.append('line')
                    .attr('class', 'drag-line')
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('x2', 0)
                    .attr('y2', 0);

                var dEdges = vis.selectAll('.edge')
                    .data(scope.graph.edges);
                enterEdges(dEdges);
                edges = vis.selectAll('.edge');

                var dNodes = vis.selectAll('.node')
                    .data(scope.graph.nodes);
                enterNodes(dNodes);
                nodes = vis.selectAll('.node');

                // .transition()
                // .duration(750)
                // .ease('elastic')
                // .attr('r', 40);

                var dNodeLabels = vis.selectAll('.node-label')
                    .data(scope.graph.nodes, function(d) { return d.label; });
                enterNodeLabels(dNodeLabels);
                nodeLabels = vis.selectAll('.node-label');

                force.start();
            }

            var update = function() {
                force
                    .nodes(scope.graph.nodes)
                    .links(scope.graph.edges);

                var dEdges = vis.selectAll('.edge')
                    .data(scope.graph.edges);
                enterEdges(dEdges);
                dEdges.exit().remove();
                edges = vis.selectAll('.edge');

                var dNodes = vis.selectAll('.node')
                    .data(scope.graph.nodes);
                enterNodes(dNodes);
                dNodes.exit().remove();
                nodes = vis.selectAll('.node');
                // .transition()
                // .duration(750)
                // .ease('elastic')
                // .attr('r', 40);

                var dNodeLabels = vis.selectAll('.node-label')
                    .data(scope.graph.nodes, function(d) { return d.label; });
                enterNodeLabels(dNodeLabels);
                dNodeLabels.exit().remove();
                nodeLabels = vis.selectAll('.node-label');

                force.start();
            };

            render();
            scope.$watch('graph', function() {
                update();
            }, true);

            //     // add keyboard callback
        //     d3.select(window)
        //         .on('keydown', keydown);

            // focus on svg
            // vis.node().focus();

        //     init_ui_hooks();

        //     // scope.$watch('graph', function (newVal, oldVal) {
        //     //     rGraph.datum(newVal).call(rGraph);
        //     // });

        }
    }
}]);
