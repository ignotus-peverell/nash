/* global angular, _ */

'use strict';

var nash = angular.module('nash');

nash.service(
    'GraphService',
    ['$http',
     function ($http) {

         var makePath = function(endpoint, pathSegments) {
             return ['/_' + endpoint].concat(pathSegments).join('/');
         };

         this.getHelperGraph = function(helperId, graph) {
             var helper = _.find(graph.helpers, function(h) {
                 return h.id === helperId;
             });

             var nodes = _.map(graph.nodes, function(n) {
                 return _.assign(n, _.find(helper.view_nodes, ['id', n.id]));
             });

             var edges = _.map(graph.edges, function(n) {
                 return _.assign(
                     n,
                     _.find(helper.view_edges, {'source': n.source,
                                                'target': n.target})
                 );
             });
             return {
                 save_id: graph.save_id,
                 save_name: graph.save_name,
                 helpers: graph.helpers,
                 default_helper: graph.default_helper,
                 edges: edges,
                 nodes: nodes
             };
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
