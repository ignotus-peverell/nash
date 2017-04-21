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
                graph: '=',
                originalGraph: '='
            },
            link: function(scope, element, attrs) {
                scope.changeView = function(helper) {
                    scope.graph = GraphService.createHelperGraph(
                        helper.id, scope.originalGraph);
                };
            }
        }
    }
]);
