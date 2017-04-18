/* global angular, d3, $ */

'use strict';

var nash = angular.module('nash');

nash.controller('GraphCtrl', [
    '$scope',
    '$routeParams',
    'api',
    function($scope, $routeParams, api) {
        // TODO: parse route params
        //        var graphId = $routeParams.id;
        var graphId = 2;
        var editModes = ['edit', 'move'];
        $scope.loadingGraph = false;
        $scope.editMode = 'edit';

        $scope.selectedEditMode = 'edit';

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
