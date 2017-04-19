/* global angular */

'use strict';

var nash = angular.module('nash');

nash.directive('edgeOptionsMenu', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/partials/graph/edge-options-menu.html',
        scope: {
            edge: '=',
        },
        link: function(scope, element, attrs) {
            scope.$watch('edge', function() {
                console.log('Edge Options Menu', arguments);
            });
            scope.edgeMeanings = [
                {name: 'Causes', value: 'cause'},
                {name: 'Prevents', value: 'prevent'},
                {name: 'References', value: 'reference'}
            ];

        }
    }
});
