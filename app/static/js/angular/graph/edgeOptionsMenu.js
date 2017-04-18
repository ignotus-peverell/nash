/* global angular */

'use strict';

var nash = angular.module('nash');

nash.directive('edgeOptionsMenu', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/partials/graph/edge-options-menu.html',
        scope:{
            graph: '=graph'
        },
        link: function(scope, element, attrs) {

        }
    }
});
