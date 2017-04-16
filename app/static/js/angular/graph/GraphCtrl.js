/* global angular, d3, $ */

'use strict';

var nash = angular.module('nash');

var renderGraph = function(graph) {
    var helpers = graph.helpers;
    var default_helper = graph.default_helper;
    var nodes2 = graph.nodes;
    var edges2 = graph.edges;

    helpers.forEach(function (h) {

        d3.select("#helpers").append("img").attr("src", h.photo)
            .on("click", function (x) {
                adopt_view(h);
            });

        d3.select("#helpers").append("span").text(h.name)
            .on("click", function (x) {
                adopt_view(h);
            });
    });

    while (nodes.length > 0) {
        nodes.pop();
    }

    nodes2.forEach(function (n) {
        nodes.push(n);
    });

    while (edges.length > 0) {
        edges.pop();
    }

    edges2.forEach(function (l) {
        edges.push({source: nodes[l.source],
                    target: nodes[l.target],
                    detailed: l.detailed,
                    meaning: l.meaning,
                    cause_weird: l.cause_weird,
                    prevent_weird: l.prevent_weird,
                   });
    });

    adopt_view(default_helper);

    redraw();
}

nash.controller('GraphCtrl', [
    '$scope',
    '$routeParams',
    'api',
    function($scope, $routeParams, api) {
        // TODO: parse route params
        //        var graphId = $routeParams.id;
        var graphId = 2;

        $scope.loadingGraph = false;

        if (Number.isInteger(graphId)) {
            api.getGraph(graphId)
                .then(function successCallback(response) {
                    console.log("GET _graph success response: ", response)
                    $scope.graph = response.data.graph;
                    renderGraph($scope.graph);
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

        $scope.saveGraph = function() {
            console.log($scope.graph)
            api.saveGraph([], $scope.graph)
                .then(function successCallback(response) {
                    console.log("POST _graph success response: ", response)
                    renderGraph($scope.graph);
                }, function errorCallback(response) {
                    // TODO: add error handling
                    console.log("POST _graph error response: ", response)
                });
            // TODO: add back alert stuff
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

        }
    }
]);
