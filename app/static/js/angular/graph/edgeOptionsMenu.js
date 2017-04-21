/* global angular */

'use strict';

var nash = angular.module('nash');

nash.directive('edgeOptionsMenu', [
    'GraphService',
    function(GraphService) {
        var linkFn = function(scope, element, attrs) {
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
