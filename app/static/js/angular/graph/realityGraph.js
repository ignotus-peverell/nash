/* global angular, d3 */

'use strict';

var nash = angular.module('nash');

nash.directive('realityGraph', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/partials/graph/graph.html',
        scope:{
            graph: '=graph'
        },
        link: function(scope, element, attrs) {

        //     console.log('Reality Graph Directive.');
        //     console.log(scope, element);

        //     var graphEl = element[0];

        //     var markerColors = {
        //         'arrowhead-red': '#ff0000',
        //         'arrowhead-yellow': '#dddd00',
        //         'arrowhead-orange': '#ffb400',
        //         'arrowhead-green': '#00ff00',
        //         'arrowhead-black': '#000000'
        //     };

        //     var appendMarker = function(container, color) {
        //         return container
        //             .append("defs")
        //             .append("marker")
        //             .attr("id", color)
        //             .attr("refX", 6 + 3) /*must be smarter way to calculate shift*/
        //             .attr("refY", 2)
        //             .attr("markerWidth", 6)
        //             .attr("markerHeight", 4)
        //             .attr("orient", "auto")
        //             .append("path")
        //             .attr("fill", markerColors[color])
        //             .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead
        //     };


        //     var rGraph = d3.select(graphEl)
        //         .append("svg:svg")
        //         .attr("width", width)
        //         .attr("height", height)
        //         .style("border", "1px solid black")
        //         .attr("pointer-events", "all");

        //     appendMarker(rGraph, 'arrowhead-red');
        //     appendMarker(rGraph, 'arrowhead-orange');
        //     appendMarker(rGraph, 'arrowhead-green');
        //     appendMarker(rGraph, 'arrowhead-black');

        //     appendMarker(rGraph, 'arrowhead-yellow')
        //         .attr("stroke-width", 0.1)
        //         .attr("stroke-width", 0.1);

        //     // rGraph.append("defs").append("marker")
        //     //     .attr("id", "arrowhead-yellow")
        //     //     .attr("refX", 6 + 3) /*must be smarter way to calculate shift*/
        //     //     .attr("refY", 2)
        //     //     .attr("markerWidth", 6)
        //     //     .attr("markerHeight", 4)
        //     //     .attr("orient", "auto")
        //     //     .append("path")
        //     //     .attr("fill", "#dddd00")
        //     //     .attr("stroke", "#000000")
        //     //     .attr("stroke-width", 0.1)
        //     //     .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead


        //     var vis = rGraph
        //         .append('svg:g')
        //         .call(d3.behavior.zoom().on("zoom", rescale))
        //         .on("dblclick.zoom", null)
        //         .append('svg:g')
        //         .on("mousemove", mousemove)
        //         .on("mousedown", mousedown)
        //         .on("mouseup", mouseup);
        //     // ^^^^ TODO: Handle mouseevents

        //     vis.on("contextmenu", d3.contextMenu(bkgd_menu, {
        //         onOpen: function() {
        //             ui_state.context_open = true;
        //         },
        //         onClose: function() {
        //             setTimeout(function() {
        //                 ui_state.context_open = false;
        //             }, 500);
        //             reset_mouse_vars();
        //         }
        //     }));

        //     vis.append('svg:rect')
        //         .attr('width', width)
        //         .attr('height', height)
        //         .attr('fill', 'white');

        //     // init force layout
        //     var force = d3.layout.force()
        //         .size([width, height])
        //         .nodes([{x:0, y:0, id: next_id, label: next_id, detailed: next_id}]) // initialize with a single node
        //         .linkDistance(200)
        //         .charge(-1000)
        //         .on("tick", tick);
        //     next_id += 1;

        //     // line displayed when dragging new nodes
        //     var drag_line = vis.append("line")
        //         .attr("class", "drag_line")
        //         .attr("x1", 0)
        //         .attr("y1", 0)
        //         .attr("x2", 0)
        //         .attr("y2", 0);

        //     // get layout properties
        //     var nodes = force.nodes(),
        //         edges = force.links(),
        //         node = vis.selectAll(".node"),
        //         edge = vis.selectAll(".edge"),
        //         labels = vis.selectAll(".text");

        //     // add keyboard callback
        //     d3.select(window)
        //         .on("keydown", keydown);

        //     redraw();

        //     // focus on svg
        //     // vis.node().focus();

        //     init_ui_hooks();

        //     // scope.$watch('graph', function (newVal, oldVal) {
        //     //     rGraph.datum(newVal).call(rGraph);
        //     // });

        }
    }
});
