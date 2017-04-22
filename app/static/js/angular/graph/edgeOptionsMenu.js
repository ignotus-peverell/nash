/* global angular */

'use strict';

var nash = angular.module('nash');

/* Edge Options Menu Directive
 *
 * When selecting an edge in the graph, this menu appears
 * enabling the user to change edge properties.
 *
 * Example usage:
 *
 *  <edge-options-menu
 *                ng-if="graphState.selected_edge"
 *                edge="graphState.selected_edge">
 *  </edge-options-menu>
 *
 */
nash.directive('edgeOptionsMenu', [
    'GraphService',
    function(GraphService) {
        var linkFn = function(scope, element, attrs) {
            console.log('Edge Menu Options Directive.');
            scope.reverseEdge = GraphService.reverseEdge;
            scope.edgeMeanings = [
                {name: 'Causes', value: 'cause'},
                {name: 'Prevents', value: 'prevent'},
                {name: 'References', value: 'reference'}
            ];
        };

        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/static/partials/graph/edge-options-menu.html',
            scope: {
                edge: '=',
            },
            link: linkFn
        };
    }
]);
