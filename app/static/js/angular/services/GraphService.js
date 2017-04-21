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

         this.createHelperGraph = function(helperId, graph) {
             graph = _.cloneDeep(graph);
             var helper = _.find(graph.helpers, function(h) {
                 return h.id === helperId;
             });

             var nodes = _.map(graph.nodes, function(n) {
                 return _.assign(n, _.find(helper.view_nodes, ['id', n.id]));
             });

             var edges = _.map(
                 graph.edges,
                 function(n) {
                     n.id = n.source + '-' + n.target;
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

         this.addNode = function(helperGraph, x, y) {
             var nodeCount = helperGraph.nodes.length;
             var maxId = _.chain(helperGraph.nodes).map('id').max().value();
             var newNode = {
                 id: maxId + 1,
                 index: nodeCount,
                 detailed: '',
                 label: 'Untitled-' + (maxId+1),
                 locked: false,
                 truth: false,
                 x: x ? x : 0,
                 y: y ? y : 0
             };

             helperGraph.nodes.push(newNode);
             return newNode;
         };

         this.addEdge = function(helperGraph, sourceNode, targetNode) {
             var newEdge = {
                 id: sourceNode.id + '-' + targetNode.id,
                 source: sourceNode,
                 target: targetNode,
                 detailed: ''
             };
             helperGraph.edges.push(newEdge);
             return newEdge;
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
