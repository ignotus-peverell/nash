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
        },
        link: function(scope, element, attrs) {
            console.log('Reality Graph Directive.');

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

            var keydown = function() {
                scope.$apply(function() {
                    var sNode = scope.graphState.selected_node;
                    var sEdge = scope.graphState.selected_edge;

                    if (!sNode && !sEdge) {
                        return;
                    }
                    switch (d3.event.keyCode) {
                    case 8: // backspace
                    case 46:
                        if (scope.graphState.backspace_deletes) {
                            if (sNode) {
                                GraphService.deleteNode(scope.graph, sNode);
                            } else if (sEdge) {
                                GraphService.deleteEdge(scope.graph, sEdge);
                            }
                            scope.graphState.actions.toggleSelectedNode();
                            scope.graphState.actions.toggleSelectedEdge();
                        }
                        break;
                    };
                });
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

            var mouseout = function() {
                scope.$apply(function() {
                    scope.graphState.backspace_deletes = false;
                });
            };

            var mouseover = function() {
                scope.$apply(function() {
                    scope.graphState.backspace_deletes = true;
                });
            };

            var mouseup = function() {
                var d3Context = this;
                scope.$apply(function() {
                    if (scope.graphState.edit_mode === 'edit'
                        && (scope.graphState.mousedown_node && !scope.graphState.context_open)) {
                        // hide drag line
                        dragLine
                            .attr('class', 'drag-line-hidden');

                        if (!scope.graphState.mouseup_node) {
                            // add node
                            var point = d3.mouse(d3Context);
                            var newNode = GraphService.addNode(
                                scope.graph, point[0], point[1]);
                            scope.graphState.actions.toggleSelectedNode(newNode);
                            GraphService.addEdge(
                                scope.graph, scope.graphState.mousedown_node, newNode);
                        }
                    }
                    scope.graphState.actions.clearMouseState();
                });
            };

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


            var edge_menu = [
                {title: function(d) { return d.label + ' (edit)'; },
                 action: function(elm, d, i) {
                     $('#edge-label').focus();
                 }
                },
                {title: function(d) {
                    return d.detailed + ' (edit)';
                },
                 action: function(elm, d, i) {
                     $('#detailed-description-edge').focus();
                 }
                },
                {title: 'Delete',
                 action: function(elm, d, i) {
                     GraphService.deleteEdge(scope.graph, d);
                 }
                },

                {title: 'Reverse arrow',
                 action: function(elm, d, i) { GraphService.reverseEdge(d); }},

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
                    return n.label + ' (edit)';
                },
                 action: function(elm, d, i) {
                     $('#node-label').focus();
                 }
                },
                {title: function(n) {
                    return n.detailed + ' (edit)';
                },
                 action: function(elm, d, i) {
                     $('#detailed-description-node').focus();
                 }
                },
                {title: 'Delete',
                 action: function(elm, d, i) {
                     GraphService.deleteNode(scope.graph, d);
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
                    scope.$apply(scope.graphState.actions.openContextMenu);
                },
                onClose: function() {
                    $timeout(scope.graphState.actions.closeContextMenu, 500);
                    scope.graphState.actions.clearMouseState();
                }
            };


            var enterEdges = function(d) {
                d
                    .enter()
                    .append('polyline')
                    .attr('class', 'edge')
                    .on('mousedown', function(d) {
                        scope.$apply(function(){
                            scope.graphState.actions.mousedownEdge(d);
                            scope.graphState.actions.toggleSelectedEdge(d);
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
                    .data(graph.edges, function(d) {return d.id; });
                enterEdges(edge);
                edge.exit().remove();
                edge = vis.selectAll('.edge');

                // Add nodes.
                node = vis.selectAll('.node')
                    .data(graph.nodes, function(d) { return d.id; } );
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
                        return d === scope.graphState.selected_edge;
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
                        return d === scope.graphState.selected_node;
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
                            if (scope.graphState.context_open) {
                                return;
                            }

                            scope.graphState.mousedown_node = d;

                            // disable zoom
                            vis.call(d3.behavior.zoom().on('zoom', null));

                            if (scope.graphState.mousedown_node === scope.graphState.selected_node) {
                                scope.graphState.actions.toggleSelectedNode();
                            } else {
                                scope.graphState.actions.toggleSelectedNode(
                                    scope.graphState.mousedown_node);
                            }

                            // reposition drag line
                            dragLine
                                .attr('class', 'drag-line')
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
                                        scope.graphState.actions.clearMouseState();
                                        return;
                                    }

                                    // add edge
                                    var sourceNode = scope.graphState.mousedown_node;
                                    var targetNode = scope.graphState.mouseup_node;
                                    var newEdge = GraphService.addEdge(
                                        scope.graph, sourceNode, targetNode);

                                    scope.graphState.actions.toggleSelectedEdge(newEdge);

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



            scope.$watch('graph', function() {
                render(scope.graph);
            }, true);

            scope.$watch('graphState', function() {
                render(scope.graph);
            }, true);

            //     // add keyboard callback
            d3.select(window)
                .on('keydown', keydown);

            // focus on svg
            vis.node().focus();

        //     init_ui_hooks();
            render(scope.graph);
        }
    }
}]);
