'use strict';

describe('Node Options Menu Directive', function() {

    // the compiled directive template.
    var directiveElem;

    // the top-level scope that is used to inject properties into the directive.
    var ctrlScope;

    // helper function
    var getCompiledElement = function(scope, compile) {
        // This creates an html node for angular to compile with
        // a scope. In this case, the directive will replace this
        // node with directive template.
        var rawElement = angular.element('<node-options-menu ' +
                                         'node="graphState.selected_node"> ' +
                                         '</node-options-menu>');
        var compiledDirective = compile(rawElement)(scope);
        scope.$digest();
        return compiledDirective;
    };

    beforeEach(function() {
        // this loads the main module
        module('nash');
        // this loads the partials into the namespace
        // this needs to be done when testing directives
        module('nash.partials');

        var compile;
        // we need to compile the directive template before testing
        inject(function ($compile, $rootScope) {
            compile = $compile;
            ctrlScope = $rootScope.$new();
            ctrlScope.graphState = {
                selected_node: {
                    id: 1,
                    index: 0,
                    detailed: '',
                    label: 'Untitled',
                    locked: false,
                    truth: false,
                    x: 0,
                    y: 0
                }
            };
        });
        directiveElem = getCompiledElement(ctrlScope, compile);
    });


    it('should have one top-level div', function() {
        expect(directiveElem.length).toBe(1);
    });

    it('should have id on container: "#infobox-node"', function() {
        expect(directiveElem[0].id).toBe('infobox-node');
    });

    it('inputs should be bound to scope', function() {
        var isolatedScope = directiveElem.isolateScope();
        var truthCheckbox = directiveElem.find('#node-truth-checkbox');

        // By default, we said that this is false, so let's
        // click it and check that it updates the model to be true.
        truthCheckbox.click()

        // This should be the directive scope.
        expect(isolatedScope.node.truth).toBe(true);

        // This should be the parent controller scope.
        expect(ctrlScope.graphState.selected_node.truth).toBeTruthy();
    });

});
