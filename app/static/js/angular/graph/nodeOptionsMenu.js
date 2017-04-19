/* global angular */

'use strict';

var nash = angular.module('nash');

nash.directive('nodeOptionsMenu', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/partials/graph/node-options-menu.html',
        scope:{
            node: '='
        },

        link: function(scope, element, attrs) {

        }
    }
});
