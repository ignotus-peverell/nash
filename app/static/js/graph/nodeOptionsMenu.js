/* global angular */

'use strict';

var nash = angular.module('nash');

/* Node Options Menu Directive
 *
 * Mostly glue. Binds the selected node to the template
 * for rendering, etc.
 *
 * Example usage:
 *
 *  <node-options-menu
 *         ng-if="graphState.selected_node"
 *         node="graphState.selected_node">
 *  </node-options-menu>
 *
 */
nash.directive('nodeOptionsMenu', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/static/partials/graph/node-options-menu.html',
        scope:{
            node: '='
        }
    };

});
