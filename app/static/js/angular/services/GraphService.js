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

         this.createGraphFromApiResponse = function(helperId, graph) {
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
                     n = _.assign(n, _.find(
                         helper.view_edges, {'source': n.source, 'target': n.target}));
                     n.id = n.source + '-' + n.target;

                     // Now replace the source & target indices with the actual source
                     // and target indices based on index matching.
                     n.source = _.find(nodes, function(d) { return d.index === n.source})
                     n.target = _.find(nodes, function(d) { return d.index === n.target})

                     return n;
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

         this.addNode = function(graph, x, y) {
             var nodeCount = graph.nodes.length;
             var maxId = _.chain(graph.nodes).map('id').max().value();
             var maxId = maxId ? maxId : 0;
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

             graph.nodes.push(newNode);
             return newNode;
         };

         this.deleteNode = function(graph, node) {
             graph.nodes = _.filter(
                 graph.nodes, function(n) { return n.id !== node.id; });
             graph.edges = _.filter(
                 graph.edges, function(n) { return n.target.id !== node.id; });
             return graph;
         };

         this.reverseEdge = function(edge) {
             var source = edge.source;
             var target = edge.target;
             edge.source = target;
             edge.target = source;
             return edge;
         };

         this.addEdge = function(graph, sourceNode, targetNode) {
             var newEdge = {
                 id: sourceNode.index + '-' + targetNode.index,
                 source: sourceNode,
                 target: targetNode,
                 detailed: ''
             };
             graph.edges.push(newEdge);
             return newEdge;
         };

         this.deleteEdge = function(graph, edge) {
             graph.edges = _.filter(
                 graph.edges, function(n) { return n.id !== edge.id; });
             return graph;
         };


         this.initGraph = function() {
             var initGraph = {
                 nodes: [],
                 edges: [],
                 save_id: -1, // API complains if this field isn't present.
                 save_name: ''  // API complains if this field isn't present.
             };
             // TODO: Change backend to not fail hard if a save_id
             // isn't present.
             this.addNode(initGraph);
             return initGraph;
         };

         this.getGraph = function (id) {
             return $http.get(makePath('graph', [id]));
         };

         this.saveGraph = function(graph) {
             graph = _.cloneDeep(graph);
             graph.edges = _.map(graph.edges, function(n) {
                 n.source = n.source.index;
                 n.target = n.target.index;
                 return n;
             });
             return $http.post(
                 makePath('save_graph', []),
                 graph
             );
         };

     }]
);
