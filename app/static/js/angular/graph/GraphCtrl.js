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

        var editModes = ['edit', 'move'];
        $scope.loadingGraph = false;
        $scope.editMode = 'edit';

        if (Number.isInteger(graphId)) {
            api.getGraph(graphId)
                .then(function successCallback(response) {
                    console.log("GET _graph success response: ", response)
                    $scope.graph = response.data.graph;
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
