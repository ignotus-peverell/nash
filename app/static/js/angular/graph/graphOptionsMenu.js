/* global angular */

'use strict';

var nash = angular.module('nash');

nash.directive('graphOptionsMenu', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/partials/graph/graph-options-menu.html',
        scope:{
            graph: '=graph'
        },
        link: function(scope, element, attrs) {

        }
    }
});
