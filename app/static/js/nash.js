/* global d3, window, document, $ */

'use strict';

function helper_talk(data_in) {
    $("#helper-talk").show();

    console.log(data_in);
    data_in.helper_state = ui_state.helper_state;

    if (data_in.user_speech) {
        d3.select("#helper-talk").html(
            d3.select("#helper-talk").html() + data_in.user_speech);
    }
    
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: '/_helper_interaction',
        dataType: 'json',
        async: true,
        data: JSON.stringify(data_in),
        success: function (data) {
            d3.select("#helper-talk")
                .html(d3.select("#helper-talk").html() + data.helper_speech);
            d3.select("#user-talk-input")
                .html(data.response);
            ui_state.helper_state = data.helper_state;
            var div = document.getElementById("helper-talk");
            div.scrollTop = div.scrollHeight;
            if (data.create_node) {
                create_node(data.create_node);
            }
            if (data.create_edge) {
                create_edge(data.create_edge[0], data.create_edge[1]);
            }
            if (data.select_node) {
                ui_state.helper_wants_node = true;
            }
            if (data.minimize) {
                $("#helper-talk").hide();
            }
        },
        error: function (data) {
            d3.select("#helper-talk")
                .html(d3.select("#helper-talk").html() +
                      '<p class="helper-speech">I am a sad bear.</p>');
        }
    });
}

function create_node(label) {
    var node = {x: 0, y: 0, id: next_id,
                label: label, detailed: label};
    next_id += 1;
    nodes.push(node);
    redraw();
}

function create_edge(label1, label2) {
    var node1 = null;
    var node2 = null;
    nodes.forEach(function (n) {
        if (n.label === label1) {
            node1 = n;
        }
        if (n.label === label2) {
            node2 = n;
        }
    });
    if (node1 && node2) {
        edges.push({source: node1,
                    target: node2, detailed: ""});
    }

    redraw();
}

function user_speech(elt, evt) {
    var s = elt.value + String.fromCharCode(evt.keyCode);
    if (evt.keyCode == 13) {
        helper_talk({
            user_speech: '<p class="user-speech">' + s + '</p>',
            user_input: s
        });
    }
}


function invite_friend() {

    var email = document.getElementById('email').value;

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: '/_invite_friend',
        dataType: 'json',
        async: true,
        data: JSON.stringify({email: email}),
        success: function (data) {
            d3.select("#messages")
                .attr("class",
                      "alert alert-success alert-dismissible")
                .html('<strong>Invite sent to '+ email +'!</strong> <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>');
            // clear email field
            document.getElementById('email').value = '';
        },
        error: function (data) {
            d3.select("#messages")
                .attr("class", "alert alert-danger alert-dismissible")
                .html('<strong>Error!</strong> Your invite was not sent. <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>');
        }
    });

}


function confirm_friend(friend_id) {

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: '/_confirm_friend',
        dataType: 'json',
        async: true,
        data: JSON.stringify({friend_id: friend_id}),
        success: function (data) {
            window.location.reload(true); // refreshing window will show friend moved to Friends list
            // any additional messages would've been cleared by the refresh
        },
        error: function (data) {
            d3.select("#messages")
                .attr("class", "alert alert-danger alert-dismissible")
                .html('<strong>Error!</strong> Your friend was not added. <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>');
        }
    });

}

function nothing() {
    console.log('nothing');
}
