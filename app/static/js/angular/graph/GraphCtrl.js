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
                console.log('Select Node: ', node);
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
            },
            clearMouseState: function() {
                state.mousedown_edge = null;
                state.mousedown_node = null;
                state.mouseup_node = null;
            }
        };

        if (Number.isInteger(graphId)) {
            GraphService.getGraph(graphId)
                .then(function successCallback(response) {
                    console.log('GET _graph success response: ', response);
                    var graph = response.data.graph;

                    $scope.apiGraphResponse = graph;
                    $scope.graph = GraphService.createGraphFromApiResponse(
                        graph.default_helper.id,
                        graph);

                }, function errorCallback(response) {
                    // TODO: add error handling
                    console.log("GET _graph error response: ", response)
                });

        } else {
            // Initialize a new empty graph.
            $scope.graph = GraphService.initGraph();
        }

    }
]);
