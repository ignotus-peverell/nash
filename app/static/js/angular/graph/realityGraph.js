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

                console.log('rescale');
                if (!scope.graphState.mousedown_node) {

                    console.log(trans, scale)

                    vis.attr('transform',
                             'translate(' + trans + ')'
                             + ' scale(' + scale + ')');
                }
            }

            var vis = rGraph
                .append('svg:g')
                .call(d3.behavior.zoom().on('zoom', rescale))
                .on('dblclick.zoom', null)
                .append('svg:g')
                // .on('mousemove', mousemove)
                // .on('mousedown', mousedown)
                // .on('mouseup', mouseup);
            // ^^^^ TODO: Handle mouseevents

            vis.on('contextmenu', d3.contextMenu(bkgd_menu, {
                onOpen: function() {
                    scope.graphState.context_open = true;
                },
                onClose: function() {
                    setTimeout(function() {
                        scope.graphState.context_open = false;
                    }, 500);
                    // reset_mouse_vars();
                }
            }));

            vis.append('svg:rect')
                .attr('width', width)
                .attr('height', height)
                .attr('fill', 'white');

            console.log(scope.graph.nodes);
            // init force layout
            var force = d3.layout.force()
                .size([width, height])
                .nodes(scope.graph.nodes)
                .links(scope.graph.edges)
                .linkDistance(200)
                .charge(-1000)
        //         .on('tick', tick);
        //     next_id += 1;

            // line displayed when dragging new nodes
            var drag_line = vis.append('line')
                .attr('class', 'drag_line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', 0)
                .attr('y2', 0);

            // // get layout properties
            // var nodes = force.nodes(),
            //     edges = force.links(),
            //     node = vis.selectAll('.node'),
            //     edge = vis.selectAll('.edge'),
            //     labels = vis.selectAll('.text');


            var link = vis.selectAll('.link')
                .data(scope.graph.edges)
                .enter().append('line')
                .attr('class', 'link');

            // Now it's the nodes turn. Each node is drawn as a circle.

            var node = vis.selectAll('.node')
                .data(scope.graph.nodes)
                .enter().append('circle')
                .attr('class', 'node');


            force.on('end', function() {

                // When this function executes, the force layout
                // calculations have concluded. The layout will
                // have set various properties in our nodes and
                // links objects that we can use to position them
                // within the SVG container.

                // First let's reposition the nodes. As the force
                // layout runs it updates the `x` and `y` properties
                // that define where the node should be centered.
                // To move the node, we set the appropriate SVG
                // attributes to their new values. We also have to
                // give the node a non-zero radius so that it's visible
                // in the container.

                node.attr('r', width/25)
                    .attr('cx', function(d) { return d.x; })
                    .attr('cy', function(d) { return d.y; });

                // We also need to update positions of the links.
                // For those elements, the force layout sets the
                // `source` and `target` properties, specifying
                // `x` and `y` values in each case.

                link.attr('x1', function(d) { return d.source.x; })
                    .attr('y1', function(d) { return d.source.y; })
                    .attr('x2', function(d) { return d.target.x; })
                    .attr('y2', function(d) { return d.target.y; });

            });

            force.start();

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
