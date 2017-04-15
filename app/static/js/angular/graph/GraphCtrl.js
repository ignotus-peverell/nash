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
    '$http',
    function($scope, $routeParams, $http) {
        // TODO: parse route params
        //        var graphId = $routeParams.id;
        var graphId = 2;

        $scope.loadingGraph = false;

        if (Number.isInteger(graphId)) {
            $http({
                method: 'GET',
                url: '/_graph/' + graphId
            }).then(function successCallback(response) {
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

    }
]);
