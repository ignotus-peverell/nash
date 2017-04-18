/* global angular */

'use strict';

var nash = angular.module('nash');

nash.directive('helperMenu', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/partials/graph/helper-menu.html',
        scope:{
            graph: '=graph'
        },
        link: function(scope, element, attrs) {

        }
    }
});
