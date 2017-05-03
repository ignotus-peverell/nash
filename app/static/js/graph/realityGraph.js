/* global angular, d3 */

'use strict';

var nash = angular.module('nash');

/* Reality Graph Directive
 *
 * The main graph container. Defines all the graph components,
 * mouseevents, and rendering methods.
 * The graph and the graph state is defined in the GraphCtrl
 * (which should could pulled into its own service eventually).
 * The graph data is operated on via the GraphService.
 *
 *
 * Example usage:
 *
 *   <reality-graph
 *                 ng-if="graph"
 *                 graph="graph"
 *                 graph-state="graphState"
 *                 save-graph="save()">
 *   </reality-graph>
 */
nash.directive('realityGraph', [
    '$timeout',
    'GraphService',
    function($timeout, GraphService) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/partials/graph/graph.html',
        scope:{
            // The transformed graph.
            graph: '=',
            // The state of the graph. Set and defined in GraphCtrl.js.
            //
            // Note: it may be useful to create a D3SettingsService later
            // to remove code bloat in the controller.
            graphState: '=',
            // Exposed save function saving a user's graph.
            saveGraph: '&'
        },
        link: function(scope, element, attrs) {
            console.log('Reality Graph Directive.');

            /* These event handlers handle the state of affairs of the graph.
             *
             * If changing the state inside a handler, these methods need to
             * wrap their calls in the scope.$apply angular method to trigger
             * the update methods throughout the app. (See example below).
             *
             * Note: It may be useful to create a D3GraphService as a
             * convenience wrapper.
             */
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
                // Since we're wrapping the function in the scope.$apply method,
                // we grab the context here to use later in the apply block.
                var d3Context = this;
                scope.$apply(function(){
                    if (scope.graphState.edit_mode === 'edit') {
                        if (!scope.graphState.mousedown_node || scope.graphState.context_open) {
                            return;
                        }

                        // update drag line
                        dragLine
                            .attr('x1', scope.graphState.mousedown_node.x)
                            .attr('y1', scope.graphState.mousedown_node.y)
                            .attr('x2', d3.mouse(d3Context)[0])
                            .attr('y2', d3.mouse(d3Context)[1]);

                    } else if (scope.graphState.edit_mode === 'move') {
                        if (!scope.graphState.mousedown_node || scope.graphState.context_open) {
                            return;
                        }
                        scope.graphState.mousedown_node.x = d3.mouse(d3Context)[0];
                        scope.graphState.mousedown_node.y = d3.mouse(d3Context)[1];

                        // update drag line
                        dragLine
                            .attr('x1', scope.graphState.mousedown_node.x)
                            .attr('y1', scope.graphState.mousedown_node.y)
                            .attr('x2', d3.mouse(d3Context)[0])
                            .attr('y2', d3.mouse(d3Context)[1]);
                    }

                });
            };

            var mousedown = function() {
                // We're not assigning or updating anything on the scope here,
                // so we don't need to call scope.$apply. (Though it wouldn't hurt.)
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

            // Mousedown events for .node. Also used on .node-label.
            var nodeMouseDown = function(d) {
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

            };

            var nodeMouseUp = function(d) {
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
            };

            /* Context menu options
             * These define the title and actions for items in the context
             * menus. Edges, nodes, and the background all have their own
             * menus.
             */
            var edge_menu = [{
                title: 'Delete',
                action: function(elm, d, i) {
                    GraphService.deleteEdge(scope.graph, d);
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
                    GraphService.deleteNode(scope.graph, d);
                }
            }];

            var bkgd_menu = [{
                title: 'Save',
                action: function(elm, d, i) {
                    scope.saveGraph();
                }
            }, {
                title: 'New node',
                action: function(elm, d, i) {
                    GraphService.addNode(scope.graph);
                }
            }, {
                title: 'Edit mode',
                action: function(elm, d, i) {
                    scope.graphState.edit_mode = 'edit';
                }
            }, {
                title: 'Move mode',
                action: function(elm, d, i) {
                    scope.graphState.edit_mode = 'move';
                }
            }];


            // All context menus share the same event handlers so only needs to
            //  be defined once here.
            var contextMenuHandlers = {
                onOpen: function() {
                    scope.$apply(scope.graphState.actions.openContextMenu);
                },
                onClose: function() {
                    $timeout(scope.graphState.actions.closeContextMenu, 500);
                    scope.graphState.actions.clearMouseState();
                }
            };

            // Convenience method for readability when entering
            // and adding an edge to the svg graph.
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

            // Convenience method for readability when entering
            // and adding a node to the svg graph.
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

            // Convenience method for readability when entering
            // and adding a node-label to the svg graph.
            var enterNodeLabels = function(d) {
                d
                    .enter()
                    .append('text')
                    .attr('class', 'node-label');
            };

            // This render method gets called on initialization,
            // when the underlying graph data changes, or when
            // the graphState changes.
            var render = function(graph) {
                // Add edges.
                edge = edgeContainer.selectAll('.edge')
                    .data(graph.edges);
                edge.exit().remove();
                enterEdges(edge);
                edge = vis.selectAll('.edge');

                // Add nodes.
                node = nodeContainer.selectAll('.node')
                    .data(graph.nodes);
                node.exit().remove();
                enterNodes(node);
                node = vis.selectAll('.node');

                // Add node labels.
                nodeLabel = nodeContainer.selectAll('.node-label')
                    .data(graph.nodes);
                nodeLabel.exit().remove();
                enterNodeLabels(nodeLabel);
                nodeLabel = vis.selectAll('.node-label');

                force
                    .nodes(graph.nodes)
                    .links(graph.edges)
                    .on('tick', tick)
                    .start();
            }

            var tick = function() {
                // Tick tock.
                //
                // This method gets executed a bunch to jiggle
                // around all the nodes and edges during an application of
                // force. Basically anytime the graph, graphState, or mouse
                // changes, this executes until it reaches some sort of
                // equilibrium.

                // ISSUE (TODO): I (Hannah F) believe that a lot of these
                // attrs and classes should get set in the render phase, but
                // for whatever reason, not all changes to an individual
                // component, like an edge, seem to propagate in the rendering
                // phase. This may be some complex angular-d3 interplay here.
                // Not sure. For now, they don't seem to be causing a
                // performance issue and changes do get picked up in the
                // tick function, so here they remain.

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
                            } else {
                                return 'url(#arrowhead-red)';
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
                            } else {
                                return 'url(#arrowhead-red)';
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
                        if (GraphService.isSelfCausingNode(scope.graph, d)) {
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
                    .on('mousedown', nodeMouseDown)
                    .on('mouseup', nodeMouseUp);

                nodeLabel
                    .attr('x', function (d) { return d.label ? d.x - 3 * d.label.length : d.x; })
                    .attr('y', function (d) { return d.y + 5; })
                    .text(function (d) { return d.label; })
                    .attr('fill', function (d) { return d.truth ? '#000000' : '#ffffff' })
                    .on('mousedown', nodeMouseDown)
                    .on('mouseup', nodeMouseUp);

            };


            // All that remains: define components and execute.
            var width = 800;
            var height = 700;
            var graphEl = element[0];

            var markerColors = {
                'arrowhead-red': '#ff0000',
                'arrowhead-yellow': '#dddd00',
                'arrowhead-orange': '#ffb400',
                'arrowhead-green': '#00ff00',
                'arrowhead-black': '#000000'
            };

            // Helper function for assigning marker defs.
            var appendMarkerDef = function(container, color) {
                return container
                    .append("defs")
                    .append("marker")
                    .attr("id", color)
                    .attr("refX", 6 + 3) /*must be smarter way to calculate shift*/
                    .attr("refY", 2)
                    .attr("markerWidth", 6)
                    .attr("markerHeight", 4)
                    .attr("orient", "auto")
                    .append("path")
                    .attr("fill", markerColors[color])
                    .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead
            };

            var rGraph = d3.select(graphEl)
                .append('svg:svg')
                .attr('width', width)
                .attr('height', height)
                .style('border', '1px solid black')
                .attr('pointer-events', 'all');

            appendMarkerDef(rGraph, 'arrowhead-red');
            appendMarkerDef(rGraph, 'arrowhead-orange');
            appendMarkerDef(rGraph, 'arrowhead-green');
            appendMarkerDef(rGraph, 'arrowhead-black');
            appendMarkerDef(rGraph, 'arrowhead-yellow')
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

            var edgeContainer = vis.append('svg:g')
                .attr('class', 'edge-container');

            var nodeContainer = vis.append('svg:g')
                .attr('class', 'node-container');

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
                .attr('stroke-dasharray', '10, 5' )
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', 0)
                .attr('y2', 0);

            scope.$watch('graph', function() {
                render(scope.graph);
            }, true);

            scope.$watch('graphState', function() {
                render(scope.graph);
            }, true);

            // add keyboard callback
            d3.select(window)
                .on('keydown', keydown);

            // focus on svg
            vis.node().focus();

            render(scope.graph);
        }
    }
}]);
