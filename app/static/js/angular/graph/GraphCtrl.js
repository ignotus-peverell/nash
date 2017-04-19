/* global angular, d3, $ */

'use strict';

var nash = angular.module('nash');

nash.controller('GraphCtrl', [
    '$scope',
    '$routeParams',
    'api',
    function($scope, $routeParams, api) {
        var graphId = parseInt($routeParams.graphId);

        console.log('GraphCtrl: Loading graph ', graphId)

        $scope.loadingGraph = false;
        $scope.graphState = {
            edit_mode: 'edit', // ['edit', 'move'];
            selected_node: null,
            selected_edge: null,
            mousedown_edge: null,
            mousedown_node: null,
            mouseup_node: null,
            backspace_deletes: true,
            context_open: false
        };

        if (Number.isInteger(graphId)) {
            api.getGraph(graphId)
                .then(function successCallback(response) {
                    console.log("GET _graph success response: ", response)
                    $scope.graph = response.data.graph;

                    $scope.edge = $scope.graph.edges[0];
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
