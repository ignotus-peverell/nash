/* global angular  */

'use strict';

var nash = angular.module('nash');

/* Graph Controller.
 *
 * This controller is responsible for parsing the graphId
 * from the path and retrieving it from the api. It also
 * transforms the api response into a more friendly graph
 * structure for the rest of the application (cough cough...
 * d3). It also defines the default graph state and exposes
 * methods to change this state.
 *
 */
nash.controller('GraphCtrl', [
    '$scope',
    '$routeParams',
    'GraphService',
    function($scope, $routeParams, GraphService) {
        var graphId = parseInt($routeParams.graphId);
        console.log('GraphCtrl: Loading graph ', graphId)

        // For now, the controller defines and exposes methods
        // for mutating the graph state (amongst other things).
        // Eventually, it would be nice to move state tracking
        // and methods into its on service.

        // The graph state model.
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

        // The actions for mutating the graph state.
        var actions = $scope.graphState.actions = {
            mousedownEdge: function(edge) {
                graphState.mousedown_edge = edge;
            },
            toggleSelectedEdge: function(edge) {
                graphState.selected_edge = graphState.selected_edge === edge ? null : edge;
                graphState.selected_node = null;
            },
            toggleSelectedNode: function(node) {
                graphState.selected_node = node === graphState.selected_edge ? null : node;
                graphState.selected_edge = null;
                graphState.backspace_deletes = graphState.selected_node !== null ? true : false;
            },
            openContextMenu: function() {
                graphState.context_open = true;
            },
            closeContextMenu: function() {
                graphState.context_open = false;
            },
            clearMouseState: function() {
                graphState.mousedown_edge = null;
                graphState.mousedown_node = null;
                graphState.mouseup_node = null;
            }
        };

        // If the graphId parsed from the route parameters is an
        // integer, then we assume it's a graphId and try to retrieve
        // it from the api.
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
                    console.log('GET _graph error response: ', response)
                });

        } else { // Otherwise, we assume we are making a new graph.
            $scope.graph = GraphService.initGraph();
        }

        // Method for saving the graph. This gets exposed to various directives.
        $scope.save = function() {
            graphState.is_saving = true;
            GraphService.saveGraph($scope.graph)
                .then(function successCallback(response) {
                    graphState.is_saving = false;
                    console.log('POST _graph success response: ', response)
                    // Normally you would assign the graph to the response data, like,
                    //      $scope.graph = response.data.graph
                    // However, the `_save_graph` endpoint currently only returns
                    // a status. Might want to change this as a TODO.

                    // Alerts to be refactored once the rest of the site has been
                    // converted to angular. (JQuery in angular is code smell.)
                    $('#messages')
                        .addClass('alert alert-success alert-dismissible')
                        .html('<strong>Saved!</strong> <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>');

                }, function errorCallback(response) {
                    graphState.is_saving = false;
                    console.log('POST _graph error response: ', response)
                    // Alerts to be refactored once the rest of the site has been
                    // converted to angular. (JQuery in angular is code smell.)
                    $('#messages')
                        .addClass('alert alert-danger alert-dismissible')
                        .html('<strong>Error!</strong> Your work was not saved. <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>');
                });
        };

    }
]);
