/* global angular, d3, $ */

'use strict';

var nash = angular.module('nash');

nash.controller('GraphCtrl', [
    '$scope',
    '$routeParams',
    'GraphService',
    function($scope, $routeParams, GraphService) {
        var graphId = parseInt($routeParams.graphId);

        console.log('GraphCtrl: Loading graph ', graphId)

        var state = $scope.state = {
            edit_mode: 'edit', // options = ['edit', 'move']
            selected_node: null,
            selected_edge: null,
            mousedown_edge: null,
            mousedown_node: null,
            mouseup_node: null,
            backspace_deletes: true,
            context_open: false
        };

        var events = $scope.state.events = {
            mousedownEdge: function(edge) {
                console.log('Mousedown Edge: ', edge);
                console.log($scope)
                state.mousedown_edge = edge;
                //$scope.state.selected_edge = edge;
                events.selectEdge(edge === state.selected_edge ? null : edge);
            },
            selectEdge: function(edge) {
                console.log('Select Edge: ', edge);
                state.selected_edge = state.selected_edge === edge ? null : edge;
                state.selected_node = null;
            },
            selectNode: function(node) {
                console.log('Select Edge: ', node);
                state.selected_node = node === state.selected_edge ? null : node;
                state.selected_edge = null;
                state.backspace_deletes = state.selected_node !== null ? true : false;
            },
            openContextMenu: function() {
                console.log('Opening context menu.');
                state.context_open = true;
            },
            closeContextMenu: function() {
                console.log('Closing context menu.');
                state.context_open = false;
            }
        };

        var operations = $scope.state.operations = {
            addEdge: function(source, target, edges) {
                console.log('Adding edge');
                console.log(source, target)
                var edge = {source: source, target: target, id: source.id + '-' + target.id};
                $scope.graph.edges.push(edge);
                console.log(edges)
                events.selectEdge(edge);
            },
            addNode: function(graph) {
                console.log('Adding Node');
            }
        };


        if (Number.isInteger(graphId)) {
            GraphService.getGraph(graphId)
                .then(function successCallback(response) {
                    console.log('GET _graph success response: ', response);
                    $scope.graph = GraphService.getHelperGraph(
                        response.data.graph.default_helper.id,
                        response.data.graph);
                    console.log('Transformed Graph: ', $scope.graph);

                    $scope.state.events.selectEdge($scope.graph.edges[0]);
                    // ^^^ FOR TESTING

                    $scope.node = $scope.graph.nodes[0];
                    // ^^^ FOR TESTING

                    $scope.graphDataLoaded = true;
                }, function errorCallback(response) {
                    // TODO: add error handling
                    console.log("GET _graph error response: ", response)
                    $scope.graphDataLoaded = true;
                });

        } else {
            // TODO: initialize new graph
            $scope.graphDataLoaded = true;
        }

    }
]);
