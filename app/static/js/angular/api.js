/* global angular, d3, $ */

'use strict';

var nash = angular.module('nash');

nash.service(
    'api',
    ['$http',
     function ($http) {

         var makePath = function(endpoint, pathSegments) {
             return ['/_' + endpoint].concat(pathSegments).join('/');
         };

         this.getGraph = function (id) {
             return $http.get(makePath('graph', [id]));
         };

         this.saveGraph = function(id, graph) {
             return $http.post(
                 makePath('save_graph', []),
                 graph
             );
         };

     }]
);
