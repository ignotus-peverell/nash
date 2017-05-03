/* global angular */

'use strict';

// Initialize nash module.
angular.module('nash', ['ngRoute'])
    .config([
        '$routeProvider',
        '$locationProvider',
        function($routeProvider, $locationProvider) {
             $routeProvider
                .when('/:graphId', {
                    templateUrl: '/static/partials/pages/graph.html',
                    controller: 'GraphCtrl'
                });
            $locationProvider.html5Mode(true);
        }
    ]);
