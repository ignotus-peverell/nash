/* global angular */

'use strict';

var nash = angular.module('nash');

nash.directive('graphOptionsMenu', [
    'api',
    function(api) {

        var linkFn = function(scope, element, attrs) {
            scope.save = function() {
                console.log(scope.graph)
                api.saveGraph([], scope.graph)
                    .then(function successCallback(response) {
                        console.log("POST _graph success response: ", response)
                        // Normally you would do something here like,
                        //      scope.graph = response.data.graph
                        // However, the save graph endpoint currently only returns
                        // a status. Might want to change this as a TODO.
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
        };

        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/static/partials/graph/graph-options-menu.html',
            scope:{
                graph: '=graph'
            },
            link: linkFn
        };

    }
]);
