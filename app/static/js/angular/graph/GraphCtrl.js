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
            context_open: false,
            is_saving: false
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

        // Save the graph.
        $scope.save = function() {
            $scope.graphState.is_saving = true;
            GraphService.saveGraph($scope.graph)
                .then(function successCallback(response) {
                    $scope.graphState.is_saving = false;
                    console.log("POST _graph success response: ", response)
                    // Normally you would assign the graph to the response data, like,
                    //      $scope.graph = response.data.graph
                    // However, the `_save_graph` endpoint currently only returns
                    // a status. Might want to change this as a TODO.
                }, function errorCallback(response) {
                    $scope.graphState.is_saving = false;
                    // TODO: add error handling
                    console.log("POST _graph error response: ", response)
                    // TODO: Expose api errors to frontend. <--- Discuss strategy.
                    //
                    // Code from previous alert handlers:
                    //     success: function (data) {
                    //         d3.select("#messages")
                    //             .attr("class",
                    //                   "alert alert-success alert-dismissible")
                    //             .html('<strong>Saved!</strong> <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>');
                    //     },
                    //     error: function (data) {
                    //         d3.select("#messages")
                    //             .attr("class", "alert alert-danger alert-dismissible")
                    //             .html('<strong>Error!</strong> Your work was not saved. <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>');
                    //     }

                });
        };

    }
]);
