/* global angular */

'use strict';

var nash = angular.module('nash');

nash.directive( 'helperMenu',  [
    'GraphService',
    function(GraphService) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/static/partials/graph/helper-menu.html',
            scope:{
                apiGraphResponse: '=', // The graph response from the server.
                graph: '=' // The main graph structure for application.
            },
            link: function(scope, element, attrs) {
                // Change the graph to be from the perspective of the
                // selected helper.
                scope.changeView = function(helper) {
                    scope.graph = GraphService.createGraphFromApiResponse(
                        helper.id, scope.apiGraphResponse);
                };
            }
        }
    }
]);
