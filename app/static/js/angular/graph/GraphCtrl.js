/* global angular  */

'use strict';

var nash = angular.module('nash');

nash.controller('GraphCtrl', [
    '$scope',
    '$routeParams',
    'GraphService',
    function($scope, $routeParams, GraphService) {
        var graphId = parseInt($routeParams.graphId);

        console.log('GraphCtrl: Loading graph ', graphId)

        var graphState = $scope.graphState = {
            edit_mode: 'edit', // options = ['edit', 'move']
            selected_node: null,
            selected_edge: null,
            mousedown_edge: null,
            mousedown_node: null,
            mouseup_node: null,
            backspace_deletes: true,
            context_open: false
        };

        var actions = $scope.graphState.actions = {
            mousedownEdge: function(edge) {
                console.log('Mousedown Edge: ', edge);
                graphState.mousedown_edge = edge;
            },
            toggleSelectedEdge: function(edge) {
                console.log('Toggle Selected Edge: ', edge);
                graphState.selected_edge = graphState.selected_edge === edge ? null : edge;
                graphState.selected_node = null;
            },
            toggleSelectedNode: function(node) {
                console.log('Toggle Selected Node: ', node);
                graphState.selected_node = node === graphState.selected_edge ? null : node;
                graphState.selected_edge = null;
                graphState.backspace_deletes = graphState.selected_node !== null ? true : false;
            },
            openContextMenu: function() {
                console.log('Opening context menu.');
                graphState.context_open = true;
            },
            closeContextMenu: function() {
                console.log('Closing context menu.');
                graphState.context_open = false;
            },
            clearMouseState: function() {
                console.log('Resetting mouse vars.');
                graphState.mousedown_edge = null;
                graphState.mousedown_node = null;
                graphState.mouseup_node = null;
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
