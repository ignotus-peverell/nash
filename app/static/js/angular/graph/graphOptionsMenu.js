/* global angular */

'use strict';

var nash = angular.module('nash');

nash.directive('graphOptionsMenu', [
    'GraphService',
    function(GraphService) {
        var linkFn = function(scope, element, attrs) {
            // Add a node to the graph.
            scope.addNode = function() {
                var newNode = GraphService.addNode(scope.graph);
                scope.graphState.actions.toggleSelectedNode({node: newNode});
                scope.graphState.edit_mode = 'edit';
            };
        };

        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/static/partials/graph/graph-options-menu.html',
            scope: {
                graph: '=',
                graphState: '=',
                save: '&'
            },
            link: linkFn
        };

    }
]);
