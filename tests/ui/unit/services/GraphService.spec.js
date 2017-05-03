'use strict';

describe('GraphService', function() {
    var GraphService;

    beforeEach(function() {
        module('nash');
    });

    beforeEach(inject(function (_GraphService_) {
        GraphService = _GraphService_;
    }));

    it('should have GraphService to be defined', function() {
        // Ensures that the GraphService exists and has been injected.
        expect(GraphService).toBeDefined();
    });

    it('should initialize a new graph with one node', function() {
        var graph = GraphService.initGraph();
        var singleNode = graph.nodes[0];
        var graphProps = ['save_id', 'save_name', 'edges', 'nodes']

        // Test the graph contains graph props.
        _.each(graphProps, function(p) {
            expect(_.has(graph, p)).toBe(true);
        });

        // Test the graph only has those properties.
        expect(_.keys(graph).length).toEqual(graphProps.length);

        // Test top-level graph properties.
        expect(graph.save_id).toBe(-1);
        expect(graph.save_name).toBe('');
        expect(graph.edges.length).toBe(0);
        expect(graph.nodes.length).toBe(1);

        // Test single node id and index just for fun.
        expect(singleNode.id).toBe(1);
        expect(singleNode.index).toBe(0);

    });

});
