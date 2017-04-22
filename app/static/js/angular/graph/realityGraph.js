/* global angular, d3 */

'use strict';

var nash = angular.module('nash');

nash.directive('realityGraph', [
    '$timeout',
    'GraphService',
    'graphComponents',
    function($timeout, GraphService, graphComponents) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/partials/graph/graph.html',
        scope:{
            graph: '=',
            graphState: '=',
            saveGraph: '&'
        },
        link: function(scope, element, attrs) {
            console.log('Reality Graph Directive.');

            // Scope shorthands.
            var sGraph = scope.graph;
            var sGraphState = scope.graphState;
            var sSaveGraph = scope.saveGraph;

            var keydown = function() {
                scope.$apply(function() {
                    var sNode = sGraphState.selected_node;
                    var sEdge = sGraphState.selected_edge;

                    if (!sNode && !sEdge) {
                        return;
                    }
                    switch (d3.event.keyCode) {
                    case 8: // backspace
                    case 46:
                        if (sGraphState.backspace_deletes) {
                            if (sNode) {
                                GraphService.deleteNode(sGraph, sNode);
                            } else if (sEdge) {
                                GraphService.deleteEdge(sGraph, sEdge);
                            }
                            sGraphState.actions.toggleSelectedNode();
                            sGraphState.actions.toggleSelectedEdge();
                        }
                        break;
                    };
                });
            };

            // rescale g
            var rescale = function() {
                var trans = d3.event.translate;
                var scale = d3.event.scale;
                if (!sGraphState.mousedown_node) {
                    vis.attr('transform',
                             'translate(' + trans + ')'
                             + ' scale(' + scale + ')');
                }
            };

            var mousemove = function() {
                if (sGraphState.edit_mode === 'edit') {
                    if (!sGraphState.mousedown_node || sGraphState.context_open) {
                        return;
                    }

                    // update drag line
                    dragLine
                        .attr('x1', sGraphState.mousedown_node.x)
                        .attr('y1', sGraphState.mousedown_node.y)
                        .attr('x2', d3.mouse(this)[0])
                        .attr('y2', d3.mouse(this)[1]);

                } else if (sGraphState.edit_mode === 'move') {
                    if (!sGraphState.mousedown_node || sGraphState.context_open) {
                        return;
                    }
                    sGraphState.mousedown_node.x = d3.mouse(this)[0];
                    sGraphState.mousedown_node.y = d3.mouse(this)[1];

                    // update drag line
                    dragLine
                        .attr('x1', sGraphState.mousedown_node.x)
                        .attr('y1', sGraphState.mousedown_node.y)
                        .attr('x2', d3.mouse(this)[0])
                        .attr('y2', d3.mouse(this)[1]);
                }
            };

            var mousedown = function() {
                if (sGraphState.edit_mode === 'edit') {
                    if (!sGraphState.mousedown_node && !sGraphState.mousedown_edge) {
                        // allow panning if nothing is selected
                        vis.call(d3.behavior.zoom().on('zoom', rescale));
                        return;
                    }
                }
            };

            var mouseout = function() {
                scope.$apply(function() {
                    sGraphState.backspace_deletes = false;
                });
            };

            var mouseover = function() {
                scope.$apply(function() {
                    sGraphState.backspace_deletes = true;
                });
            };

            var mouseup = function() {
                var d3Context = this;
                scope.$apply(function() {
                    if (sGraphState.edit_mode === 'edit'
                        && (sGraphState.mousedown_node && !sGraphState.context_open)) {
                        // hide drag line
                        dragLine
                            .attr('class', 'drag-line-hidden');

                        if (!sGraphState.mouseup_node) {
                            // add node
                            var point = d3.mouse(d3Context);
                            var newNode = GraphService.addNode(
                                sGraph, point[0], point[1]);
                            sGraphState.actions.toggleSelectedNode(newNode);
                            GraphService.addEdge(
                                sGraph, sGraphState.mousedown_node, newNode);
                        }
                    }
                    sGraphState.actions.clearMouseState();
                });
            };


            var edge_menu = [{
                title: 'Delete',
                action: function(elm, d, i) {
                    GraphService.deleteEdge(sGraph, d);
                }
            }, {
                title: 'Reverse arrow',
                action: function(elm, d, i) { GraphService.reverseEdge(d); }
            }];


            var node_menu = [{
                title: function(n) {
                    return n.truth ? 'Make False' : 'Make True';
                },
                action: function(elm, d, i) {
                    d.truth = !d.truth;
                }
            }, {
                title: function(n) {
                    return n.locked ? 'Unlock' : 'Lock';
                },
                action: function(elm, d, i) {
                    d.locked = !d.locked;
                }
            }, {
                title: 'Delete',
                action: function(elm, d, i) {
                    GraphService.deleteNode(sGraph, d);
                }
            }];

            var bkgd_menu = [{
                title: 'Save',
                action: function(elm, d, i) {
                    sSaveGraph();
                }
            }, {
                title: 'New node',
                action: function(elm, d, i) {
                    GraphService.addNode(sGraph);
                }
            }, {
                title: 'Edit mode',
                action: function(elm, d, i) {
                    sGraphState.edit_mode = 'edit';
                }
            }, {
                title: 'Move mode',
                action: function(elm, d, i) {
                    sGraphState.edit_mode = 'move';
                }
            }];

            var contextMenuHandlers = {
                onOpen: function() {
                    scope.$apply(sGraphState.actions.openContextMenu);
                },
                onClose: function() {
                    $timeout(sGraphState.actions.closeContextMenu, 500);
                    sGraphState.actions.clearMouseState();
                }
            };


            var enterEdges = function(d) {
                d
                    .enter()
                    .insert('polyline', 'polyline')
                    .attr('class', 'edge')
                    .on('mousedown', function(d) {
                        scope.$apply(function(){
                            sGraphState.actions.mousedownEdge(d);
                            sGraphState.actions.toggleSelectedEdge(d);
                        });
                    })
                    .on('contextmenu', d3.contextMenu(edge_menu, contextMenuHandlers));

            };

            var enterNodes = function(d) {
                d
                    .enter()
                    .append('circle')
                    .attr('r', 30)
                    .attr('class', 'node')
                    .on('contextmenu', d3.contextMenu(node_menu,  contextMenuHandlers))
                    .transition()
                    .duration(750)
                    .ease('elastic')
                    .attr('r', 40);

            };

            var enterNodeLabels = function(d) {
                d
                    .enter()
                    .append('text')
                    .attr('class', 'node-label');
            };

            var render = function(graph) {
                console.log('RENDERING....')

                force
                    .nodes(graph.nodes)
                    .links(graph.edges)
                    .on('tick', tick);

                // Add edges.
                edge = vis.selectAll('.edge')
                    .data(graph.edges);
                enterEdges(edge);
                edge.exit().remove();
                edge = vis.selectAll('.edge');

                // Add nodes.
                node = vis.selectAll('.node')
                    .data(graph.nodes);
                enterNodes(node);
                node.exit().remove();
                node = vis.selectAll('.node');

                // Add node labels.
                nodeLabel = vis.selectAll('.node-label')
                    .data(graph.nodes);
                enterNodeLabels(nodeLabel);
                nodeLabel.exit().remove();
                nodeLabel = vis.selectAll('.node-label');

                force.start();
            }

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

                edge
                    .attr('points', function (d) {
                        var endX = (2 * d.source.x + 3 * d.target.x) / 5.0;
                        var endY = (2 * d.source.y + 3 * d.target.y) / 5.0;
                        return [d.source.x,
                                d.source.y + ' ' + endX,
                                endY + ' ' +
                                d.target.x, d.target.y].join(',');
                    })
                    .classed('reference-edge', function(d) { return d.meaning === 'reference'})
                    .classed('edge-selected', function (d) {
                        return d === sGraphState.selected_edge;
                    })
                    .attr('marker-mid', function(d) {
                        if (d.meaning === 'reference') {
                            return ''
                        } else if (d.meaning === 'cause' && d.source.truth && !d.target.truth) {
                            if (d.cause_weird === '0') {
                                return 'url(#arrowhead-green)';
                            }
                            else if (d.cause_weird === '1') {
                                return 'url(#arrowhead-yellow)';
                            }
                            else if (d.cause_weird === '2') {
                                return 'url(#arrowhead-orange)';
                            }
                        } else if (d.meaning === 'prevent' && d.source.truth && d.target.truth) {
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



                node
                    .attr('cx', function(d) { return d.x; })
                    .attr('cy', function(d) { return d.y; })
                    .classed('node-true', function (d) { return d.truth; })
                    .classed('node-locked', function (d) { return d.locked; })
                    .classed('node-selected', function (d) {
                        return d === sGraphState.selected_node;
                    })

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
                    .on('mousedown', function(d) {
                        scope.$apply(function() {
                            if (sGraphState.context_open) {
                                return;
                            }

                            sGraphState.mousedown_node = d;

                            // disable zoom
                            vis.call(d3.behavior.zoom().on('zoom', null));

                            if (sGraphState.mousedown_node === sGraphState.selected_node) {
                                sGraphState.actions.toggleSelectedNode();
                            } else {
                                sGraphState.actions.toggleSelectedNode(
                                    sGraphState.mousedown_node);
                            }

                            // reposition drag line
                            dragLine
                                .attr('class', 'drag-line')
                                .attr('x1', sGraphState.mousedown_node.x)
                                .attr('y1', sGraphState.mousedown_node.y)
                                .attr('x2', sGraphState.mousedown_node.x)
                                .attr('y2', sGraphState.mousedown_node.y);
                        });
                    })
                    .on('mouseup',
                        function (d) {
                            scope.$apply(function() {
                                if (sGraphState.mousedown_node) {
                                    sGraphState.mouseup_node = d;
                                    if (sGraphState.mouseup_node
                                        === sGraphState.mousedown_node) {
                                        sGraphState.actions.clearMouseState();
                                        return;
                                    }

                                    // add edge
                                    var sourceNode = sGraphState.mousedown_node;
                                    var targetNode = sGraphState.mouseup_node;
                                    var newEdge = GraphService.addEdge(
                                        sGraph, sourceNode, targetNode);

                                    sGraphState.actions.toggleSelectedEdge(newEdge);

                                    // enable zoom
                                    vis.call(d3.behavior.zoom().on('zoom', rescale));
                                }
                            });
                        });

                nodeLabel
                    .attr('x', function (d) { return d.label ? d.x - 3 * d.label.length : d.x; })
                    .attr('y', function (d) { return d.y + 5; })
                    .text(function (d) { return d.label; })
                    .attr('fill', function (d) { return d.truth ? '#000000' : '#ffffff' });

            };

            // Define the graph and svg components.
            var width = 800;
            var height = 700;
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


            var vis = rGraph
                .append('svg:g')
                .call(d3.behavior.zoom().on('zoom', rescale))
                .on('dblclick.zoom', null)
                .append('svg:g')
                .on('mousemove', mousemove)
                .on('mousedown', mousedown)
                .on('mouseup', mouseup)
                .on('mouseout', mouseout)
                .on('mouseover', mouseover)
                .on('contextmenu', d3.contextMenu(bkgd_menu, contextMenuHandlers));

            vis.append('svg:rect')
                .attr('width', width)
                .attr('height', height)
                .attr('fill', 'white');

            var force = d3.layout.force()
                .size([width, height])
                .linkDistance(200)
                .charge(-1000);

            // get layout properties
            var node = vis.selectAll('.node');
            var edge = vis.selectAll('.edge');
            var nodeLabel = vis.selectAll('.text');

            // line displayed when dragging new nodes
            var dragLine = vis.append('line')
                .attr('class', 'drag-line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', 0)
                .attr('y2', 0);



            scope.$watch('graph', function() {
                render(sGraph);
            }, true);

            scope.$watch('graphState', function() {
                render(sGraph);
            }, true);

            //     // add keyboard callback
            d3.select(window)
                .on('keydown', keydown);

            // focus on svg
            vis.node().focus();

        //     init_ui_hooks();
            render(sGraph);
        }
    }
}]);
