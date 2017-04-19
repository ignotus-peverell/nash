/*global d3, vis, trans, drag_line, nodes, edges, node, edge, redraw, force,
  window, labels, document, $ */

// 'use strict';

// var width = 800;
// var height = 700;
// var fill = d3.scale.category20();
// var next_id = 0;


// var node_menu = [
//     {title: function(n) {
//         return n.label + " (edit)";
//     },
//      action: function(elm, d, i) {
//          $("#node-label").focus();
//      }
//     },
//     {title: function(n) {
//         return n.detailed + " (edit)";
//     },
//      action: function(elm, d, i) {
//          $("#detailed-description-node").focus();
//      }
//     },
//     {title: 'Delete',
//      action: function(elm, d, i) {
//          delete_node(elm);
//          redraw();
//      }
//     },
//     {title: function(n) {
//         if (n.truth) {
//             return 'Make false';
//         } else {
//             return 'Make true';
//         }
//     },
//      action: function(elm, d, i) {
//          d.truth = !d.truth;
//          redraw();
//      }
//     },
//     {title: 'Very likely to happen for no reason',
//      action: function(elm, d, i) {
//          d.self_cause_weird = '0';
//          redraw();
//      }
//     },
//     {title: 'Fairly likely to happen for no reason',
//      action: function(elm, d, i) {
//          d.self_cause_weird = '1';
//          redraw();
//      }
//     },
//     {title: 'Somewhat likely to happen for no reason',
//      action: function(elm, d, i) {
//          d.self_cause_weird = '2';
//          redraw();
//      }
//     },
//     {title: 'Not at all likely to happen for no reason',
//      action: function(elm, d, i) {
//          d.self_cause_weird = '3';
//          redraw();
//      }
//     },
// ]

// var edge_menu = [
//     {title: function(e) {
//         return e.label + " (edit)";
//     },
//      action: function(elm, d, i) {
//          $("#edge-label").focus();
//      }
//     },
//     {title: function(e) {
//         return e.detailed + " (edit)";
//     },
//      action: function(elm, d, i) {
//          $("#detailed-description-edge").focus();
//      }
//     },
//     {title: 'Delete',
//      action: function(elm, d, i) {
//          delete_edge(elm);
//          redraw();
//      }
//     },
//     {title: 'Reverse arrow',
//      action: function(elm, d, i) {
//          var tmp = d.source;
//          d.source = d.target;
//          d.target = tmp;
//          redraw();
//      }
//     },
//     {title: 'Feels like a reference to',
//      action: function(elm, d, i) {
//          d.meaning = 'reference'
//          redraw();
//      }
//     },
//     {title: 'Very likely to cause',
//      action: function(elm, d, i) {
//          d.meaning = 'cause'
//          d.cause_weird = '3';
//          redraw();
//      }
//     },
//     {title: 'Fairly likely to cause',
//      action: function(elm, d, i) {
//          d.meaning = 'cause'
//          d.cause_weird = '2';
//          redraw();
//      }
//     },
//     {title: 'Somewhat likely to cause',
//      action: function(elm, d, i) {
//          d.meaning = 'cause'
//          d.cause_weird = '1';
//          redraw();
//      }
//     },
//     {title: 'Not at all likely to cause',
//      action: function(elm, d, i) {
//          d.meaning = 'cause'
//          d.cause_weird = '0';
//          redraw();
//      }
//     },
//     {title: 'Very likely to prevent',
//      action: function(elm, d, i) {
//          d.meaning = 'prevent'
//          d.prevent_weird = '3';
//          redraw();
//      }
//     },
//     {title: 'Fairly likely to prevent',
//      action: function(elm, d, i) {
//          d.meaning = 'prevent'
//          d.prevent_weird = '2';
//          redraw();
//      }
//     },
//     {title: 'Somewhat likely to prevent',
//      action: function(elm, d, i) {
//          d.meaning = 'prevent'
//          d.prevent_weird = '1';
//          redraw();
//      }
//     },
//     {title: 'Not at all likely to prevent',
//      action: function(elm, d, i) {
//          d.meaning = 'prevent'
//          d.prevent_weird = '0';
//          redraw();
//      }
//     },
// ]

// function adopt_view(helper) {
//     console.log(helper);
//     helper.view_nodes.forEach(function (n) {
//         console.log(n);
//         nodes[n.index].truth = n.truth;
//         nodes[n.index].self_cause_weird = n.self_cause_weird;
//     });

//     redraw();
// }

// function select_node(node) {
//     console.log("select_node", node, scope.graphState.selected_node);
//     scope.graphState.selected_node = node;

//     if (node !== null) {
//         scope.graphState.selected_edge = null;

//         show_node_infobox();

//         // fill in values
//         d3.select("#node-label").attr("value", node.label);
//         $("#detailed-description-node").val(node.detailed);

//         // fill in checkboxes
//         if (node.truth) {
//             d3.select("#truth").property("checked", true);
//         } else {
//             d3.select("#truth").property("checked", false);
//         }
//         if (node.locked) {
//             d3.select("#locked").property("checked", true);
//         } else {
//             d3.select("#locked").property("checked", false);
//         }

//         // fill in self-cause weirdness
//         $("#self-cause-weird").val(node.self_cause_weird);

//         // blur inputs and turn on backspace_deletes
//         document.getElementById("node-label").blur();
//         document.getElementById("detailed-description-node").blur();
//         scope.graphState.backspace_deletes = true;

//     }

//     redraw();
// }

// function select_edge(edge) {
//     scope.graphState.selected_edge = edge;

//     if (edge !== null) {
//         show_edge_infobox();

//         scope.graphState.selected_node = null;

//         // fill in values
//         $("#detailed-description-edge").val(edge.detailed);
//         $("#cause-weird").val(edge.cause_weird);
//         $("#prevent-weird").val(edge.prevent_weird);
//         $("#edge-meaning").val(edge.meaning);
//     }
// }

// function change_label(new_label) {
//     if (scope.graphState.selected_node !== null) {
//         nodes[scope.graphState.selected_node.index].label = new_label;
//         redraw();
//     }
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
//     $.ajax({
//         type: "POST",
//         contentType: "application/json; charset=utf-8",
//         url: '/_save_graph',
//         dataType: 'json',
//         async: true,
//         data: JSON.stringify({nodes: nodes,
//                               edges: edges2,
//                               save_name: document.getElementById('save-name').value,
//                               save_id: document.getElementById('save-id').value,
//                              }),
//         success: function (data) {
//             d3.select("#messages")
//                 .attr("class",
//                       "alert alert-success alert-dismissible")
//                 .html('<strong>Saved!</strong> <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>');
//         },
//         error: function (data) {
//             d3.select("#messages")
//                 .attr("class", "alert alert-danger alert-dismissible")
//                 .html('<strong>Error!</strong> Your work was not saved. <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>');
//         }
//     });
// }



// function init_ui_hooks() {
//     d3.select("#node-label").on("input", function () {
//         change_label(this.value);
//     }).on("focus", function () {
//         scope.graphState.backspace_deletes = false;
//     });

//     d3.select("#edge-label").on("input", function () {
//         change_label(this.value);
//     }).on("focus", function () {
//         scope.graphState.backspace_deletes = false;
//     });

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


// function mousedown() {
//     if (scope.graphState.mode === "arrow") {
//         if (!scope.graphState.mousedown_node && !scope.graphState.mousedown_edge) {
//             // allow panning if nothing is selected
//             vis.call(d3.behavior.zoom().on("zoom", rescale));
//             return;
//         }
//     } else if (scope.graphState.mode === "move") {
//         console.log("move mousedown");
//     }
// }

// function mousemove() {
//     if (scope.graphState.mode === "arrow") {
//         if (!scope.graphState.mousedown_node || scope.graphState.context_open) {
//             return;
//         }

//         console.log('mousemove', scope.graphState.context_open);

//         // update drag line
//         drag_line
//             .attr("x1", scope.graphState.mousedown_node.x)
//             .attr("y1", scope.graphState.mousedown_node.y)
//             .attr("x2", d3.mouse(this)[0])
//             .attr("y2", d3.mouse(this)[1]);

//     } else if (scope.graphState.mode === "move") {
//         if (!scope.graphState.mousedown_node || scope.graphState.context_open) {
//             return;
//         }
//         scope.graphState.mousedown_node.x = d3.mouse(this)[0];
//         scope.graphState.mousedown_node.y = d3.mouse(this)[1];

//         // update drag line
//         drag_line
//             .attr("x1", scope.graphState.mousedown_node.x)
//             .attr("y1", scope.graphState.mousedown_node.y)
//             .attr("x2", d3.mouse(this)[0])
//             .attr("y2", d3.mouse(this)[1]);
//     }
// }

// function reset_mouse_vars() {
//     scope.graphState.mousedown_node = null;
//     scope.graphState.mouseup_node = null;
//     scope.graphState.mousedown_edge = null;
// }

// function mouseup() {
//     if (scope.graphState.mode === "arrow") {
//         if (scope.graphState.mousedown_node && !scope.graphState.context_open) {
//             // hide drag line
//             drag_line
//                 .attr("class", "drag_line_hidden");

//             if (!scope.graphState.mouseup_node) {
//                 // add node
//                 var point = d3.mouse(this),
//                     node = {x: point[0], y: point[1], id: next_id,
//                             label: "label", detailed: next_id};
//                 next_id += 1;
//                 nodes.push(node);

//                 // select new node
//                 select_node(node);

//                 // add edge to mousedown node
//                 edges.push({source: scope.graphState.mousedown_node,
//                             target: node, detailed: ""});
//             }

//             redraw();
//         }
//     } else if (scope.graphState.mode === "move") {
//         console.log("move mouseup");
//     }
//     // clear mouse event vars
//     reset_mouse_vars();
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
//         .classed("reference-edge", function(d) {
//             return d.meaning === "reference";
//         })
//         .attr("marker-mid", function (d) {
//             if (d.meaning === "reference") {
//                 return ""
//             }
//             if (d.failed_cause) {
//                 if (d.cause_weird === "0") {
//                     return "url(#arrowhead-green)";
//                 }
//                 if (d.cause_weird === "1") {
//                     return "url(#arrowhead-yellow)";
//                 }
//                 if (d.cause_weird === "2") {
//                     return "url(#arrowhead-orange)";
//                 }
//                 return "url(#arrowhead-red)";
//             }
//             if (d.failed_prevent) {
//                 if (d.prevent_weird === "0") {
//                     return "url(#arrowhead-green)";
//                 }
//                 if (d.prevent_weird === "1") {
//                     return "url(#arrowhead-yellow)";
//                 }
//                 if (d.prevent_weird === "2") {
//                     return "url(#arrowhead-orange)";
//                 }
//                 return "url(#arrowhead-red)";
//             }
//             return "url(#arrowhead-black)";
//         });

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

//     labels.attr("x", function (d) {
//         if (d.label) {
//             return d.x - 3 * d.label.length;
//         }
//         return d.x;
//     })
//         .attr("y", function (d) { return d.y + 5; })
//         .attr("fill", function (d) {
//             if (d.truth) {
//                 return "#000000";
//             }
//             return "#ffffff";
//         })
//         .text(function (d) { return d.label; });
// }


// // redraw graph
// function redraw() {

//     edge = edge.data(edges);

//     edge.enter().insert("polyline", ".node")
//         .attr("class", "edge")
//         .attr("marker-mid", function (d) {
//             return "url(#arrowhead-black)";
//         })
//         .on("mousedown",
//             function (d) {
//                 scope.graphState.mousedown_edge = d;
//                 if (scope.graphState.mousedown_edge === scope.graphState.selected_edge) {
//                     select_edge(null);
//                 } else {
//                     select_edge(scope.graphState.mousedown_edge);
//                 }
//                 select_node(null);
//                 redraw();
//             })
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

//     edge
//         .classed("edge_selected", function (d) {
//             return d === scope.graphState.selected_edge;
//         });

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
//         .attr("class", "node")
//         .attr("r", 30)
//         .attr("stroke-width", function (d) {
//             if (d.locked) {
//                 return 5;
//             }
//             return 2;
//         })
//         .attr("stroke", function (d) {
//             if (d.self_causing) {
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
//             return "#000000";
//         })
//         .on("mousedown",
//             function (d) {
//                 if (scope.graphState.context_open) {
//                     return;
//                 }

//                 scope.graphState.mousedown_node = d;

//                 // disable zoom
//                 vis.call(d3.behavior.zoom().on("zoom", null));

//                 console.log("mousedown node", scope.graphState.mousedown_node);
//                 if (scope.graphState.mousedown_node === scope.graphState.selected_node) {
//                     console.log("mdnode === snode");
//                     select_node(null);
//                 } else {
//                     select_node(scope.graphState.mousedown_node);
//                 }
//                 select_edge(null);

//                 // reposition drag line
//                 drag_line
//                     .attr("class", "edge")
//                     .attr("x1", scope.graphState.mousedown_node.x)
//                     .attr("y1", scope.graphState.mousedown_node.y)
//                     .attr("x2", scope.graphState.mousedown_node.x)
//                     .attr("y2", scope.graphState.mousedown_node.y);

//                 redraw();
//             })
//         .on("mousedrag",
//             function (ignore) {
//                 redraw();
//             })
//         .on("mouseup",
//             function (d) {
//                 if (scope.graphState.mousedown_node) {
//                     scope.graphState.mouseup_node = d;
//                     if (scope.graphState.mouseup_node === scope.graphState.mousedown_node) {
//                         reset_mouse_vars();
//                         return;
//                     }

//                     // add edge
//                     var edge = {source: scope.graphState.mousedown_node,
//                                 target: scope.graphState.mouseup_node,
//                                 detailed: ""};
//                     edges.push(edge);

//                     // select new edge
//                     select_edge(edge);

//                     // enable zoom
//                     vis.call(d3.behavior.zoom().on("zoom", rescale));
//                     redraw();
//                 }
//             })
//         .transition()
//         .duration(750)
//         .ease("elastic")
//         .attr("r", 40);
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


// var renderGraph = function(graph) {
//     var helpers = graph.helpers;
//     var default_helper = graph.default_helper;
//     var nodes2 = graph.nodes;
//     var edges2 = graph.edges;

//     helpers.forEach(function (h) {

//         d3.select("#helpers").append("img").attr("src", h.photo)
//             .on("click", function (x) {
//                 adopt_view(h);
//             });

//         d3.select("#helpers").append("span").text(h.name)
//             .on("click", function (x) {
//                 adopt_view(h);
//             });
//     });

//     while (nodes.length > 0) {
//         nodes.pop();
//     }

//     nodes2.forEach(function (n) {
//         nodes.push(n);
//     });

//     while (edges.length > 0) {
//         edges.pop();
//     }

//     edges2.forEach(function (l) {
//         edges.push({source: nodes[l.source],
//                     target: nodes[l.target],
//                     detailed: l.detailed,
//                     meaning: l.meaning,
//                     cause_weird: l.cause_weird,
//                     prevent_weird: l.prevent_weird,
//                    });
//     });

//     adopt_view(default_helper);

//     redraw();
// }
