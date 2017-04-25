/* global angular */

'use strict';

var nash = angular.module('nash');

/* Helper Menu Directive
 *
 * This panel lets you select a friend and view their perspective
 * on your graph. Note: the original graph from the api has to be
 * provided to the directive since it is used to generate a graph
 * that is renderable by the reality graph directive. In general,
 * however, the raw api response should not be used in most places
 * unless it is in a more ui-friendly format.
 *
 * Example usage:
 *
 * <helper-menu
 *      graph="graph"
 *      api-graph-response="apiGraphResponse">
 * </helper-menu>
 *
 */
nash.directive( 'helperMenu',  [
    'GraphService',
    function(GraphService) {
        var linkFn = function(scope, element, attrs) {
            console.log('Helper Menu Directive.');
            // Change the graph to be from the perspective of the
            // selected helper.
            scope.changeView = function(helper) {
                scope.graph = GraphService.createGraphFromApiResponse(
                    helper.id, scope.apiGraphResponse);
            };
        };

        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/static/partials/graph/helper-menu.html',
            scope:{
                apiGraphResponse: '=', // The graph response from the server.
                graph: '=' // The main graph structure for application.
            },
            link: linkFn
        };

    }
]);
