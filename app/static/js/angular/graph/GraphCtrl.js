/* global angular */

'use strict';

var nash = angular.module('nash');

nash.controller('GraphCtrl', [
    '$scope',
    '$routeParams',
    '$http',
    function($scope, $routeParams, $http) {
        console.log("hello world");
        console.log($routeParams)

        $scope.sayHello = "Hello Nash!";


        // var helpers = {{ helpers | safe }};
        // var default_helper = {{ default_helper | safe }};
        // var nodes2 = {{ nodes | safe }};
        // var edges2 = {{ edges | safe}};

        // helpers.forEach(function (h) {

        //     d3.select("#helpers").append("img").attr("src", h.photo)
        //         .on("click", function (x) {
        //             adopt_view(h);
        //         });

        //     d3.select("#helpers").append("span").text(h.name)
        //         .on("click", function (x) {
        //             adopt_view(h);
        //         });
        // });

        // while (nodes.length > 0) {
        //     nodes.pop();
        // }

        // nodes2.forEach(function (n) {
        //     nodes.push(n);
        // });

        // while (edges.length > 0) {
        //     edges.pop();
        // }

        // edges2.forEach(function (l) {
        //     edges.push({source: nodes[l.source],
        //                 target: nodes[l.target],
        //                 detailed: l.detailed,
        //                 meaning: l.meaning,
        //                 cause_weird: l.cause_weird,
        //                 prevent_weird: l.prevent_weird,
        //                });
        // });

        // adopt_view(default_helper);

        // redraw();

    }
]);
