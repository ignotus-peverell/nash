/* global angular */

'use strict';

var nash = angular.module('nash');

nash.directive('arrowOptionsMenu', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/partials/graph/arrow-options-menu.html',
        scope:{
            graph: '=graph'
        },
        link: function(scope, element, attrs) {

        }
    }
});