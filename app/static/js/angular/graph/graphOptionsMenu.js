/* global angular */

'use strict';

var nash = angular.module('nash');

nash.directive('graphOptionsMenu', [
    'GraphService',
    function(GraphService) {

        var linkFn = function(scope, element, attrs) {
            // Used as toggle after saving and waiting for the GraphService to
            // return a response.
            scope.isSaving = false;

            // Add a node to the graph.
            scope.addNode = function() {
                var newNode = GraphService.addNode(scope.graph);
                scope.selectNode({node: newNode});
                scope.editMode = 'edit';
            };

            // Save the graph.
            scope.save = function() {
                scope.isSaving = true;
                console.log(scope.graph)
                GraphService.saveGraph([], scope.graph)
                    .then(function successCallback(response) {
                        scope.isSaving = false;
                        console.log("POST _graph success response: ", response)
                        // Normally you would assign the graph to the response data, like,
                        //      scope.graph = response.data.graph
                        // However, the `_save_graph` endpoint currently only returns
                        // a status. Might want to change this as a TODO.
                    }, function errorCallback(response) {
                        scope.isSaving = false;
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

            };
        };

        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/static/partials/graph/graph-options-menu.html',
            scope: {
                graph: '=',
                editMode: '=',
                selectNode: '&'
            },
            link: linkFn
        };

    }
]);
