/*global d3, vis, trans, drag_line, nodes, edges, node, edge, redraw, force,
  window, labels, document, $ */

"use strict";

var width = 800;
var height = 700;
var fill = d3.scale.category20();
var next_id = 0;

var ui_state = {
    mode: "arrow",
    selected_node: null,
    selected_edge: null,
    mousedown_edge: null,
    mousedown_node: null,
    mouseup_node: null,
    backspace_deletes: true
}

function adopt_view(helper) {
    console.log(helper);
    helper.view_nodes.forEach(function (n) {
        console.log(n);
        nodes[n.index].truth = n.truth;
    });

    redraw();
}

function show_node_infobox() {
    d3.select("#infobox-node").style("display", "block");
    d3.select("#infobox-edge").style("display", "none");
}

function show_edge_infobox() {
    d3.select("#infobox-node").style("display", "none");
    d3.select("#infobox-edge").style("display", "block");
}

function show_no_infobox() {
    d3.select("#infobox-node").style("display", "none");
    d3.select("#infobox-edge").style("display", "none");
}

function select_node(node) {
    console.log("select_node", node, ui_state.selected_node);
    ui_state.selected_node = node;

    if (node !== null) {
        ui_state.selected_edge = null;
        
        show_node_infobox();

        // fill in values
        d3.select("#node-label").attr("value", node.label);
        $("#detailed-description-node").val(node.detailed);

        // fill in checkboxes
        if (node.truth) {
            d3.select("#truth").property("checked", true);
        } else {
            d3.select("#truth").property("checked", false);
        }
        if (node.locked) {
            d3.select("#locked").property("checked", true);
        } else {
            d3.select("#locked").property("checked", false);
        }

        // fill in self-cause weirdness
        $("#self-cause-weird").val(node.self_cause_weird);
        
        // blur inputs and turn on backspace_deletes
        document.getElementById("node-label").blur();
        document.getElementById("detailed-description-node").blur();
        ui_state.backspace_deletes = true;

    }

    redraw();
}

function select_edge(edge) {
    ui_state.selected_edge = edge;

    if (edge !== null) {
        show_edge_infobox();

        ui_state.selected_node = null;

        // fill in values
        $("#detailed-description-edge").val(edge.detailed);
        $("#cause-weird").val(edge.cause_weird);
        $("#prevent-weird").val(edge.prevent_weird);
        $("#edge-meaning").val(edge.meaning);
    }
}

function change_label(new_label) {
    if (ui_state.selected_node !== null) {
        nodes[ui_state.selected_node.index].label = new_label;
        redraw();
    }
}

function reverse_arrow() {
    if (ui_state.selected_edge !== null) {
        var tmp = ui_state.selected_edge.target;
        ui_state.selected_edge.target = ui_state.selected_edge.source;
        ui_state.selected_edge.source = tmp;
    }
}

function new_node() {
    nodes.push({x: 0, y: 0, id: next_id, label: next_id, detailed: next_id});
    next_id += 1;
    redraw();
}

function mode_arrows() {
    ui_state.mode = "arrow";
}

function mode_move() {
    ui_state.mode = "move";
}

function mark_cause() {
    ui_state.selected_edge.meaning = "cause";
}

function mark_prevent() {
    ui_state.selected_edge.meaning = "prevent";
}

function mark_true() {
    ui_state.selected_node.truth = d3.select("#truth").property("checked");
    redraw();
}

function populate_self_cause_weird(value) {
    ui_state.selected_node.self_cause_weird = value;
    redraw();
}

function populate_cause_weird(value) {
    ui_state.selected_edge.cause_weird = value;
    redraw();
}

function populate_prevent_weird(value) {
    ui_state.selected_edge.prevent_weird = value;
    redraw();
}

function populate_edge_meaning(value) {
    ui_state.selected_edge.meaning = value;
    redraw();
}

function mark_locked() {
    ui_state.selected_node.locked = d3.select("#locked").property("checked");
    redraw();
}

function mark_false() {
    ui_state.selected_node.truth = false;
    redraw();
}

function save() {
    var edges2 = [];
    edges.forEach(function (l) {
        edges2.push({source: l.source.index, 
                     target: l.target.index,
                     detailed: l.detailed,
                     meaning: l.meaning,
                     cause_weird: l.cause_weird,
                     prevent_weird: l.prevent_weird,
                    });
    });
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: '/_save_graph',
        dataType: 'json',
        async: true,
        data: JSON.stringify({nodes: nodes,
                              edges: edges2,
                              save_name: document.getElementById('save-name').value,
                              save_id: document.getElementById('save-id').value,
                             }),
        success: function (data) {
            d3.select("#messages")
                .attr("class",
                      "alert alert-success alert-dismissible")
                .html('<strong>Saved!</strong> <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>');
        },
        error: function (data) {
            d3.select("#messages")
                .attr("class", "alert alert-danger alert-dismissible")
                .html('<strong>Error!</strong> Your work was not saved. <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>');
        }
    });
}

function init_ui_hooks() {
    d3.select("#node-label").on("input", function () {
        change_label(this.value);
    }).on("focus", function () {
        ui_state.backspace_deletes = false;
    });

    d3.select("#edge-label").on("input", function () {
        change_label(this.value);
    }).on("focus", function () {
        ui_state.backspace_deletes = false;
    });

    d3.select("#self-cause-weird").on("input", function () {
        populate_self_cause_weird(this.value);
    });

    d3.select("#cause-weird").on("input", function () {
        populate_cause_weird(this.value);
    });

    d3.select("#prevent-weird").on("input", function () {
        populate_prevent_weird(this.value);
    });

    d3.select("#edge-meaning").on("input", function () {
        populate_edge_meaning(this.value);
    });

    d3.select("#detailed-description-node").on("input", function () {
        if (ui_state.selected_node !== null) {
            nodes[ui_state.selected_node.index].detailed = this.value;
        }
    }).on("focus", function () {
        ui_state.backspace_deletes = false;
    });

    d3.select("#detailed-description-edge").on("input", function () {
        if (ui_state.selected_edge !== null) {
            ui_state.selected_edge.detailed = this.value;
        }
    }).on("focus", function () {
        ui_state.backspace_deletes = false;
    });
}

// rescale g
function rescale() {
    var trans = d3.event.translate,
        scale = d3.event.scale;

    vis.attr("transform",
             "translate(" + trans + ")"
             + " scale(" + scale + ")");
}

function mousedown() {
    if (ui_state.mode === "arrow") {
        if (!ui_state.mousedown_node && !ui_state.mousedown_edge) {
            // allow panning if nothing is selected
            vis.call(d3.behavior.zoom().on("zoom"), rescale);
            return;
        }
    } else if (ui_state.mode === "move") {
        console.log("move mousedown");
    }
}

function mousemove() {
    if (ui_state.mode === "arrow") {
        if (!ui_state.mousedown_node) {
            return;
        }

        // update drag line
        drag_line
            .attr("x1", ui_state.mousedown_node.x)
            .attr("y1", ui_state.mousedown_node.y)
            .attr("x2", d3.svg.mouse(this)[0])
            .attr("y2", d3.svg.mouse(this)[1]);

    } else if (ui_state.mode === "move") {
        if (!ui_state.mousedown_node) {
            return;
        }
        ui_state.mousedown_node.x = d3.svg.mouse(this)[0];
        ui_state.mousedown_node.y = d3.svg.mouse(this)[1];

        // update drag line
        drag_line
            .attr("x1", ui_state.mousedown_node.x)
            .attr("y1", ui_state.mousedown_node.y)
            .attr("x2", d3.svg.mouse(this)[0])
            .attr("y2", d3.svg.mouse(this)[1]);
    }
}

function reset_mouse_vars() {
    ui_state.mousedown_node = null;
    ui_state.mouseup_node = null;
    ui_state.mousedown_edge = null;
}

function mouseup() {
    if (ui_state.mode === "arrow") {
        if (ui_state.mousedown_node) {
            // hide drag line
            drag_line
                .attr("class", "drag_line_hidden");

            if (!ui_state.mouseup_node) {
                // add node
                var point = d3.mouse(this),
                    node = {x: point[0], y: point[1], id: next_id,
                            label: next_id, detailed: next_id};
                next_id += 1;
                nodes.push(node);

                // select new node
                select_node(node);

                // add edge to mousedown node
                edges.push({source: ui_state.mousedown_node,
                            target: node, detailed: ""});
            }

            redraw();
        }
    } else if (ui_state.mode === "move") {
        console.log("move mouseup");
    }
    // clear mouse event vars
    reset_mouse_vars();
}

function tick() {
    edge.attr("points", function (d) {
        if (d.source !== undefined && d.target !== undefined) {
            return d.source.x + "," + d.source.y + " " +
                ((2 * d.source.x + 3 * d.target.x) / 5.0)
                + "," + ((2 * d.source.y + 3 * d.target.y) / 5.0) + " " +
                d.target.x + "," + d.target.y;
        }
        return "";
    })
        .attr("marker-mid", function (d) {
            if (d.failed_cause) {
                if (d.cause_weird === "0") {
                    return "url(#arrowhead-green)";
                }
                if (d.cause_weird === "1") {
                    return "url(#arrowhead-yellow)";
                }
                if (d.cause_weird === "2") {
                    return "url(#arrowhead-orange)";
                }
                return "url(#arrowhead-red)";
            }
            if (d.failed_prevent) {
                if (d.prevent_weird === "0") {
                    return "url(#arrowhead-green)";
                }
                if (d.prevent_weird === "1") {
                    return "url(#arrowhead-yellow)";
                }
                if (d.prevent_weird === "2") {
                    return "url(#arrowhead-orange)";
                }
                return "url(#arrowhead-red)";
            }
            return "url(#arrowhead-black)";
        });

    node.attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .attr("stroke-width", function (d) {
            if (d.locked) {
                return 5;
            }
            return 2;
        })
        .attr("stroke", function (d) {
            if (d.self_causing) {
                if (d.self_cause_weird === "0") {
                    return "#00ff00";
                }
                if (d.self_cause_weird === "1") {
                    return "#ffff00";
                }
                if (d.self_cause_weird === "2") {
                    return "#ffb400";
                }
                return "#ff0000";
            }
            return "#000000";
        })
        .attr("fill", function (d) {
            if (d === ui_state.selected_node) {
                return "#ffb400";
            }
            
            if (d.truth) {
                return "#ffffff";
            }
            return "#999999";
        });

    labels.attr("x", function (d) {
        if (d.label !== undefined) {
            return d.x - 3 * d.label.length;
        }
        return d.x;
    })
        .attr("y", function (d) { return d.y + 5; })
        .attr("fill", function (d) {
            if (d.truth) {
                return "#000000";
            }
            return "#ffffff";
        })
        .text(function (d) { return d.label; });
}


// redraw graph
function redraw() {

    edge = edge.data(edges);

    edge.enter().insert("polyline", ".node")
        .attr("class", "edge")
        .attr("marker-mid", function (d) {
            return "url(#arrowhead-black)";
        })
        .on("mousedown",
            function (d) {
                ui_state.mousedown_edge = d;
                if (ui_state.mousedown_edge === ui_state.selected_edge) {
                    select_edge(null);
                } else {
                    select_edge(ui_state.mousedown_edge);
                }
                select_node(null);
                redraw();
            });

    edge.exit().remove();

    edge
        .classed("edge_selected", function (d) {
            return d === ui_state.selected_edge;
        });

    nodes.forEach(function (n) {
        if (n.truth) {
            n.self_causing = true;
            edges.forEach(function (l) {
                if (l.source.truth && l.target === n) {
                    n.self_causing = false;
                }
            });
        } else {
            n.self_causing = false;
        }
    });

    edges.forEach(function (l) {
        if (l.meaning == "cause" && l.source.truth && !l.target.truth) {
            l.failed_cause = true;
        } else {
            l.failed_cause = false;
        }
        if (l.meaning == "prevent" && l.source.truth && l.target.truth) {
            l.failed_prevent = true;
        } else {
            l.failed_prevent = false;
        }
    });

    node = node.data(nodes);

    node.enter().insert("circle")
        .attr("class", "node")
        .attr("r", 30)
        .attr("stroke-width", function (d) {
            if (d.locked) {
                return 5;
            }
            return 2;
        })
        .attr("stroke", function (d) {
            if (d.self_causing) {
                return "#ff0000";
            }
            return "#000000";
        })
        .attr("fill", function (d) {
            if (d === ui_state.selected_node) {
                return "#ffb400";
            }
            if (d.truth) {
                return "#ffffff";
            }
            return "#000000";
        })
        .on("mousedown",
            function (d) {
                // disable zoom
                vis.call(d3.behavior.zoom().on("zoom"), null);

                ui_state.mousedown_node = d;
                console.log("mousedown node", ui_state.mousedown_node);
                if (ui_state.mousedown_node === ui_state.selected_node) {
                    console.log("mdnode === snode");
                    select_node(null);
                } else {
                    select_node(ui_state.mousedown_node);
                }
                select_edge(null);

                // reposition drag line
                drag_line
                    .attr("class", "edge")
                    .attr("x1", ui_state.mousedown_node.x)
                    .attr("y1", ui_state.mousedown_node.y)
                    .attr("x2", ui_state.mousedown_node.x)
                    .attr("y2", ui_state.mousedown_node.y);

                redraw();
            })
        .on("mousedrag",
            function (ignore) {
                redraw();
            })
        .on("mouseup",
            function (d) {
                if (ui_state.mousedown_node) {
                    ui_state.mouseup_node = d;
                    if (ui_state.mouseup_node === ui_state.mousedown_node) {
                        reset_mouse_vars();
                        return;
                    }

                    // add edge
                    var edge = {source: ui_state.mousedown_node,
                                target: ui_state.mouseup_node,
                                detailed: ""};
                    edges.push(edge);

                    // select new edge
                    select_edge(edge);

                    // enable zoom
                    vis.call(d3.behavior.zoom().on("zoom"), rescale);
                    redraw();
                }
            })
        .transition()
        .duration(750)
        .ease("elastic")
        .attr("r", 40);

    node.exit().transition()
        .attr("r", 0)
        .remove();

    node
        .classed("node_selected", function (d) {
            return d === ui_state.selected_node;
        });

    labels = labels.data(nodes);
    labels.enter()
        .insert("text")
        .attr("class", "text")
        .attr("x", function (d) { return d.x - 5; })
        .attr("y", function (d) { return d.y + 5; })
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("fill", function (d) {
            if (d.truth) {
                return "#000000";
            }
            return "#ffffff";
        })
        .text(function (d) { return d.label; });

    labels.exit().remove();

    if (d3.event) {
        // prevent browser's default behavior
        d3.event.preventDefault();
    }

    force.start();

}

function splice_edges_for_node(node) {
    var toSplice = edges.filter(
        function (l) {
            return (l.source === node) || (l.target === node);
        }
    );
    toSplice.map(
        function (l) {
            edges.splice(edges.indexOf(l), 1);
        }
    );
}

function keydown() {
    if (!ui_state.selected_node && !ui_state.selected_edge) {
        return;
    }
    switch (d3.event.keyCode) {
    case 8: // backspace
    case 46:
        if (ui_state.backspace_deletes) {
            if (ui_state.selected_node) {
                nodes.splice(nodes.indexOf(ui_state.selected_node), 1);
                splice_edges_for_node(ui_state.selected_node);
            } else if (ui_state.selected_edge) {
                edges.splice(edges.indexOf(ui_state.selected_edge), 1);
            }
            select_node(null);
            select_edge(null);
            redraw();
        }
        break;
    }
}

// init svg
var outer = d3.select("#chart")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .style("border", "1px solid black")
    .attr("pointer-events", "all");

var vis = outer
    .append('svg:g')
    .call(d3.behavior.zoom().on("zoom", rescale))
    .on("dblclick.zoom", null)
    .append('svg:g')
    .on("mousemove", mousemove)
    .on("mousedown", mousedown)
    .on("mouseup", mouseup);

vis.append('svg:rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'white');

// init force layout
var force = d3.layout.force()
    .size([width, height])
    .nodes([{x:0, y:0, id: next_id, label: next_id, detailed: next_id}]) // initialize with a single node
    .linkDistance(200)
    .charge(-1000)
    .on("tick", tick);
next_id += 1;

// line displayed when dragging new nodes
var drag_line = vis.append("line")
    .attr("class", "drag_line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", 0);

// get layout properties
var nodes = force.nodes(),
    edges = force.links(),
    node = vis.selectAll(".node"),
    edge = vis.selectAll(".edge"),
    labels = vis.selectAll(".text");

// add keyboard callback
d3.select(window)
    .on("keydown", keydown);

redraw();

// focus on svg
// vis.node().focus();

outer.append("defs").append("marker")
    .attr("id", "arrowhead-red")
    .attr("refX", 6 + 3) /*must be smarter way to calculate shift*/
    .attr("refY", 2)
    .attr("markerWidth", 6)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("fill", "#ff0000")
    .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead

outer.append("defs").append("marker")
    .attr("id", "arrowhead-orange")
    .attr("refX", 6 + 3) /*must be smarter way to calculate shift*/
    .attr("refY", 2)
    .attr("markerWidth", 6)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("fill", "#ffb400")
    .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead

outer.append("defs").append("marker")
    .attr("id", "arrowhead-yellow")
    .attr("refX", 6 + 3) /*must be smarter way to calculate shift*/
    .attr("refY", 2)
    .attr("markerWidth", 6)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("fill", "#dddd00")
    .attr("stroke", "#000000")
    .attr("stroke-width", 0.1)
    .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead

outer.append("defs").append("marker")
    .attr("id", "arrowhead-green")
    .attr("refX", 6 + 3) /*must be smarter way to calculate shift*/
    .attr("refY", 2)
    .attr("markerWidth", 6)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("fill", "#00ff00")
    .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead

outer.append("defs").append("marker")
    .attr("id", "arrowhead-black")
    .attr("refX", 6 + 3) /*must be smarter way to calculate shift*/
    .attr("refY", 2)
    .attr("markerWidth", 6)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead

init_ui_hooks();
