/*global d3, vis, trans, drag_line, nodes, edges, node, edge, redraw, force,
  window, labels, document, $ */

// 'use strict';

// var width = 800;
// var height = 700;
// var fill = d3.scale.category20();
// var next_id = 0;



// function adopt_view(helper) {
//     console.log(helper);
//     helper.view_nodes.forEach(function (n) {
//         console.log(n);
//         nodes[n.index].truth = n.truth;
//         nodes[n.index].self_cause_weird = n.self_cause_weird;
//     });

//     redraw();
// }



// function reverse_arrow() {
//     if (scope.graphState.selected_edge !== null) {
//         var tmp = scope.graphState.selected_edge.target;
//         scope.graphState.selected_edge.target = scope.graphState.selected_edge.source;
//         scope.graphState.selected_edge.source = tmp;
//     }
// }

// function new_node() {
//     nodes.push({x: 0, y: 0, id: next_id, label: "label", detailed: next_id});
//     next_id += 1;
//     redraw();
// }


// function save() {
//     var edges2 = [];
//     edges.forEach(function (l) {
//         edges2.push({source: l.source.index,
//                      target: l.target.index,
//                      detailed: l.detailed,
//                      meaning: l.meaning,
//                      cause_weird: l.cause_weird,
//                      prevent_weird: l.prevent_weird,
//                     });
//     });
// }



// function init_ui_hooks() {

//     d3.select("#self-cause-weird").on("input", function () {
//         populate_self_cause_weird(this.value);
//     });

//     d3.select("#cause-weird").on("input", function () {
//         populate_cause_weird(this.value);
//     });

//     d3.select("#prevent-weird").on("input", function () {
//         populate_prevent_weird(this.value);
//     });

//     d3.select("#edge-meaning").on("input", function () {
//         populate_edge_meaning(this.value);
//     });

//     d3.select("#detailed-description-node").on("input", function () {
//         if (scope.graphState.selected_node !== null) {
//             nodes[scope.graphState.selected_node.index].detailed = this.value;
//         }
//     }).on("focus", function () {
//         scope.graphState.backspace_deletes = false;
//     });

//     d3.select("#detailed-description-edge").on("input", function () {
//         if (scope.graphState.selected_edge !== null) {
//             scope.graphState.selected_edge.detailed = this.value;
//         }
//     }).on("focus", function () {
//         scope.graphState.backspace_deletes = false;
//     });
// }




// function reset_mouse_vars() {
//     scope.graphState.mousedown_node = null;
//     scope.graphState.mouseup_node = null;
//     scope.graphState.mousedown_edge = null;
// }


// function tick() {
//     edge.attr("points", function (d) {
//         if (d.source !== undefined && d.target !== undefined) {
//             return d.source.x + "," + d.source.y + " " +
//                 ((2 * d.source.x + 3 * d.target.x) / 5.0)
//                 + "," + ((2 * d.source.y + 3 * d.target.y) / 5.0) + " " +
//                 d.target.x + "," + d.target.y;
//         }
//         return "";
//     })

//     node.attr("cx", function (d) { return d.x; })
//         .attr("cy", function (d) { return d.y; })
//         .attr("stroke-width", function (d) {
//             if (d.locked) {
//                 return 5;
//             }
//             return 2;
//         })
//         .attr("stroke", function (d) {
//             if (d.self_causing) {
//                 if (d.self_cause_weird === "0") {
//                     return "#00ff00";
//                 }
//                 if (d.self_cause_weird === "1") {
//                     return "#ffff00";
//                 }
//                 if (d.self_cause_weird === "2") {
//                     return "#ffb400";
//                 }
//                 return "#ff0000";
//             }
//             return "#000000";
//         })
//         .attr("fill", function (d) {
//             if (d === scope.graphState.selected_node) {
//                 return "#ffb400";
//             }

//             if (d.truth) {
//                 return "#ffffff";
//             }
//             return "#999999";
//         });



// // redraw graph
// function redraw() {

//     edge = edge.data(edges);

//     edge.enter().insert("polyline", ".node")
//         .on("contextmenu", d3.contextMenu(edge_menu, {
//             onOpen: function() {
//                 scope.graphState.context_open = true;
//             },
//             onClose: function() {
//                 setTimeout(function() {
//                     scope.graphState.context_open = false;
//                 }, 500);
//                 reset_mouse_vars();
//             }
//         }));


//     edge.exit().remove();


//     nodes.forEach(function (n) {
//         if (n.truth) {
//             n.self_causing = true;
//             edges.forEach(function (l) {
//                 if (l.source.truth && l.target === n) {
//                     n.self_causing = false;
//                 }
//             });
//         } else {
//             n.self_causing = false;
//         }
//     });

//     edges.forEach(function (l) {
//         if (l.meaning == "cause" && l.source.truth && !l.target.truth) {
//             l.failed_cause = true;
//         } else {
//             l.failed_cause = false;
//         }
//         if (l.meaning == "prevent" && l.source.truth && l.target.truth) {
//             l.failed_prevent = true;
//         } else {
//             l.failed_prevent = false;
//         }
//     });

//     node = node.data(nodes);

//     node.enter().insert("circle")
//         .on("mousedown",
//             function (d) {
////                 redraw();
//             })
//         .on("mousedrag",
//             function (ignore) {
//                 redraw();
//             })
//     node.on("contextmenu", d3.contextMenu(node_menu, {
//             onOpen: function() {
//                 scope.graphState.context_open = true;
//             },
//             onClose: function() {
//                 setTimeout(function() {
//                     scope.graphState.context_open = false;
//                 }, 500);
//                 reset_mouse_vars();
//             }
//     }));


//     node.exit().transition()
//         .attr("r", 0)
//         .remove();

//     node
//         .classed("node_selected", function (d) {
//             return d === scope.graphState.selected_node;
//         });

//     labels = labels.data(nodes);
//     labels.enter()
//         .insert("text")
//         .attr("class", "text")
//         .attr("x", function (d) { return d.x - 5; })
//         .attr("y", function (d) { return d.y + 5; })
//         .attr("font-family", "sans-serif")
//         .attr("font-size", "10px")
//         .attr("fill", function (d) {
//             if (d.truth) {
//                 return "#000000";
//             }
//             return "#ffffff";
//         })
//         .text(function (d) { return d.label; });

//     labels.exit().remove();

//     if (d3.event) {
//         // prevent browser's default behavior
//         d3.event.preventDefault();
//     }

//     force.start();

// }

// function splice_edges_for_node(node) {
//     var toSplice = edges.filter(
//         function (l) {
//             return (l.source === node) || (l.target === node);
//         }
//     );
//     toSplice.map(
//         function (l) {
//             edges.splice(edges.indexOf(l), 1);
//         }
//     );
// }

// function delete_node(node) {
//     nodes.splice(nodes.indexOf(scope.graphState.selected_node), 1);
//     splice_edges_for_node(scope.graphState.selected_node);
// }

// function delete_edge(edge) {
//     edges.splice(edges.indexOf(scope.graphState.selected_edge), 1);
// }

// function keydown() {
//     if (!scope.graphState.selected_node && !scope.graphState.selected_edge) {
//         return;
//     }
//     switch (d3.event.keyCode) {
//     case 8: // backspace
//     case 46:
//         if (scope.graphState.backspace_deletes) {
//             if (scope.graphState.selected_node) {
//                 delete_node(node);
//             } else if (scope.graphState.selected_edge) {
//                 delete_edge(edge);
//             }
//             select_node(null);
//             select_edge(null);
//             redraw();
//         }
//         break;
//     }
// }
