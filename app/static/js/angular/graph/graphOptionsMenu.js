/* global angular */

'use strict';

var nash = angular.module('nash');

/* Graph Options Menu Directive
 *
 * This directive provides a menu to modify top-level
 * graph properties, like "Title". It also exposes
 * a few graph editing tools, like toggling the edit
 * mode of the graph.
 *
 * Example usage:
 *
 *  <graph-options-menu
 *          graph="graph"
 *          graph-state="graphState"
 *          save="save()">
 *  </graph-options-menu>
 *
 */
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
