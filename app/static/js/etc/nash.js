/* global d3, window, document, $ */

'use strict';

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
