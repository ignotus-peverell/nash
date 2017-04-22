/* global angular  */

'use strict';

var nash = angular.module('nash');

nash.service(
    'graphComponents',
    [function () {
        var markerColors = {
            'arrowhead-red': '#ff0000',
            'arrowhead-yellow': '#dddd00',
            'arrowhead-orange': '#ffb400',
            'arrowhead-green': '#00ff00',
            'arrowhead-black': '#000000'
        };

        this.appendMarkerDef = function(container, color) {
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
     }]
);
