import datetime
import difflib
from flask import redirect, render_template, render_template_string, Blueprint, flash
from flask import request, url_for, jsonify
from flask_user import current_user, login_required, roles_accepted
from flask_login.mixins import AnonymousUserMixin
from flask_mail import Mail, Message

from werkzeug.datastructures import CombinedMultiDict
import json, random
import cPickle as pickle
import os
import uuid
import datetime

from app.init_app import app, db
from app.models import (UserProfileForm, FriendForm, Graph, GraphRevision, User,
                        Friendship, GraphViewRevision, FriendshipInvite)
from app.images import process_profile_picture
from app.utils import (subjective_graph_nodes, subjective_graph_edges,
                       objective_graph_nodes, objective_graph_edges)
from app.helper import Helper

# set up Flask Mail
mail = Mail(app)

# The Home page is accessible to anyone
@app.route('/home')
@login_required
def home_page():
    action_items = []
    if not current_user.photo_file_name or current_user.photo_file_name == 'default.png' :
        action_item = {'type' : 'photo', 'url' : '/pages/profile', 'message':'Please upload your profile picture'}
        action_items.append(action_item)
    return render_template('pages/home_page.html',  action_items=action_items)

@app.route('/ineedhelp')
def ineedhelp_page():
    return render_template('pages/ineedhelp_page.html')

@app.route('/iwanttohelp')
def iwanttohelp_page():
    return render_template('pages/iwanttohelp_page.html')

@app.route('/manifesto')
def manifesto_page():
    return render_template('pages/manifesto_page.html')

@app.route('/landing')
def landing_page():
    return render_template('pages/landing_page.html')

@app.route('/')
def index():
    if current_user.is_anonymous:
        return render_template('pages/landing_page.html')
    else:
        return redirect(url_for('home_page'))

@app.route('/graphs')
@login_required  # Limits access to authenticated users
def graph_list_page():
    graphs = []
    for g in current_user.graphs_owned:
        graphs.append(g)
    for g in current_user.graphs_helping:
        graphs.append(g)

    return render_template('pages/graph_list_page.html', graphs=graphs)

def get_graph_data(graph):
    revision = graph.current_revision

    nodes = pickle.loads(str(revision.nodes))
    edges = pickle.loads(str(revision.edges))
    helpers = []
    default_helper = None
    owner_helper = None
    for u in graph.owners + graph.helpers:
        views = GraphViewRevision.query.filter(
            (GraphViewRevision.graph_id == graph.id)
            & (GraphViewRevision.author_id == u.id)).order_by(
                'timestamp').all()

        # construct helper dict to pass into JS
        h = dict(id=u.id,
                 name=" ".join([u.first_name, u.last_name]),
                 photo=os.path.join('/static/images/users/',
                                    u.photo_file_name))

        if len(views) > 0:
            view = views[-1]
            h['view_nodes'] = pickle.loads(str(view.nodes))
            h['view_edges'] = pickle.loads(str(view.edges))
        else:
            # if no views from this helper, use empty lists
            h['view_nodes'] = []
            h['view_edges'] = []

        helpers.append(h)

        if u == current_user:
            default_helper = h
        if u in graph.owners:
            owner_helper = h

    if default_helper is None:
        default_helper = owner_helper

    assert default_helper is not None

    return nodes, edges, helpers, default_helper
    
@app.route('/graph/<id>')
@login_required  # Limits access to authenticated users
def graph_page(id):
    graph = Graph.query.get(id)

    if current_user not in graph.owners and current_user not in graph.helpers:
        return redirect(url_for('graph_list_page'))

    nodes, edges, helpers, default_helper = get_graph_data(graph)

    return render_template('pages/graph_page.html', save_id=id,
                           graph_name=graph.name,
                           nodes=json.dumps(nodes), edges=json.dumps(edges),
                           helpers=json.dumps(helpers),
                           default_helper=json.dumps(default_helper),
                           helper_state=json.dumps("start"))

@app.route('/tutorial/<id>')
def tutorial_page(id):
    graph = Graph.query.get(id)
    if not graph.public:
        return redirect(url_for('graph_list_page'))

    nodes, edges, helpers, default_helper = get_graph_data(graph)

    return render_template('pages/graph_page.html', save_id=id,
                           graph_name=graph.name,
                           nodes=json.dumps(nodes), edges=json.dumps(edges),
                           helpers=json.dumps(helpers),
                           default_helper=json.dumps(default_helper),
                           helper_state=json.dumps(graph.name))

@app.route('/_graph/<id>')
@login_required  # Limits access to authenticated users
def graph_json(id):
    graph = Graph.query.get(id)

    if current_user not in graph.owners and current_user not in graph.helpers:
        return redirect(url_for('graph_list_page'))

    nodes, edges, helpers, default_helper = get_graph_data(graph)
    graph_data = dict(nodes=nodes,
                      edges=edges,
                      helpers=helpers,
                      default_helper=default_helper)
    
    return jsonify(graph=graph_data)


@app.route('/graph_diff/<id>')
@login_required
def graph_diff(id):
    new_revision = GraphRevision.query.get(id)

    if new_revision.previous_revision_id is None:
        diff = difflib.HtmlDiff().make_table([''],
                                             new_revision.string().split('\n'))
    else:
        old_revision = GraphRevision.query.get(new_revision.previous_revision_id)
        diff = difflib.HtmlDiff().make_table(old_revision.string().split('\n'),
                                             new_revision.string().split('\n'))

    return render_template('pages/graph_diff_page.html', diff=diff)

@app.route('/graph_history/<id>')
@login_required
def graph_history(id):
    graph = Graph.query.get(id)

    return render_template('pages/graph_history_page.html', graph=graph)

@app.route('/newgraph')
@login_required  # Limits access to authenticated users
def graph_create_page():
    print 'newgraph'
    return render_template('pages/graph_page.html',
                           nodes=json.dumps([]),
                           edges=json.dumps([]))

@app.route('/_save_graph', methods=['POST'])
@login_required  # Limits access to authenticated users
def save_graph():
    data = json.loads(request.data)
    save_id = data['save_id']
    save_name = data['save_name']
    if not save_name:
        save_name = "NO NAME"
    nodes = data['nodes']
    edges = data['edges']
    print nodes
    print edges

    graph = Graph.query.get(save_id)
    if graph is None:
        graph = Graph()
        graph.owners = [current_user]
        db.session.add(graph)
    graph.name = save_name
    graph.public = False

    view = GraphViewRevision()
    view.nodes = pickle.dumps(subjective_graph_nodes(nodes))
    view.edges = pickle.dumps(subjective_graph_edges(edges))
    view.author = current_user
    view.timestamp = datetime.datetime.now()

    revision = GraphRevision()
    revision.previous_revision_id = graph.current_revision_id
    revision.author = current_user
    revision.timestamp = datetime.datetime.now()
    revision.nodes = pickle.dumps(objective_graph_nodes(nodes))
    revision.edges = pickle.dumps(objective_graph_edges(edges))

    graph.views.append(view)
    graph.revisions.append(revision)

    # Save graph
    db.session.commit()

    graph.current_revision_id = revision.id
    db.session.commit()

    # Send notification of graph update to all owners & helpers
    # (except for current user)

    updater_name = current_user.first_name + " " + current_user.last_name
    graph_diff_url = request.host + url_for('graph_diff',
                                            id=graph.current_revision_id)

    #print "graph.owners: "
    for u in graph.owners:
        if u.id != current_user.id:
            msg_to_owner = Message(
                "%s updated graph \"%s\"" % (updater_name, graph.name),
                recipients=[u.email])
            msg_to_owner.body = render_template('emails/owner_update.html',
                                                user=u, updater_name=updater_name,
                                                graph=graph,
                                                graph_diff_url=graph_diff_url)
            mail.send(msg_to_owner)

    #print "graph.helpers: "
    for u in graph.helpers:
        if u.id != current_user.id:
            #print u.first_name + " " + u.last_name
            msg_to_helper = Message(
                "%s updated graph \"%s\"" % (updater_name, graph.name),
                recipients=[u.email])
            msg_to_helper.body = render_template('emails/helper_update.html',
                                                 user=u, updater_name=updater_name,
                                                 graph=graph,
                                                 graph_diff_url=graph_diff_url)
            mail.send(msg_to_helper)

    return jsonify(result="success")


@app.route('/_helper_interaction', methods=['POST'])
def helper_interaction():
    data = json.loads(request.data)
    if hasattr(Helper, data['helper_state']):
        new_data = getattr(Helper, data['helper_state'])(data)
    else:
        new_data = Helper.default(data)
    return json.dumps(new_data)


@app.route('/_share_graph', methods=['POST'])
@login_required  # Limits access to authenticated users
def share_graph():
    data = json.loads(request.data)
    graph_id = data['graph_id']
    user_id = data['user_id']
    graph = Graph.query.get(graph_id)
    user = User.query.get(user_id)
    graph.helpers.append(user)

    db.session.commit()

    return jsonify(result="success")


# The Admin page is accessible to users with the 'admin' role
@app.route('/admin')
@roles_accepted('admin')  # Limits access to users with the 'admin' role
def admin_page():
    return render_template('pages/admin_page.html')

# The Admin page is accessible to users with the 'admin' role
@app.route('/user/<id>')
@login_required
def user_page(id):
    user = User.query.get(id)
    return render_template('pages/user_page.html', user=user)


@app.route('/friends', methods=['GET', 'POST'])
@login_required
def friends_page():

    # get incoming *non-confirmed* friendship invites based on either ID _or_ email address

    invites = list(FriendshipInvite.query.filter( \
                     (FriendshipInvite.confirmed_at==None) & \
                     ((FriendshipInvite.friendee_id==current_user.id) | \
                      (FriendshipInvite.friendee_email==current_user.email))).all())

    # make invites unique in case there are duplicate invites
    unique_invites = []
    inviter_tracker = {}
    for i in invites:
        if i.friender_id not in inviter_tracker:
            unique_invites.append(i)
        inviter_tracker[i.friender_id] = 1

    # print [invite.friender_id for invite in unique_invites]

    # TODO: if not using Form method, can remove below and FriendForm in models.py
    form = FriendForm(request.form)
    return render_template('pages/friends_page.html',
                           friendships=current_user.friendships, form=form, incoming_invites=unique_invites)

@app.route('/_invite_friend', methods=['POST'])
@login_required
def invite_friend():

    data = json.loads(request.data)
    to_email = data['email']

    inviter_name = current_user.first_name + " " + current_user.last_name
    confirm_friend_url = request.host + url_for("friends_page")
    register_url = request.host + url_for("user.register")

    new_invite = FriendshipInvite()
    new_invite.friender_id = current_user.id
    new_invite.invited_at = datetime.datetime.utcnow()

    to_users = list(User.query.filter(User.email==to_email).all())

    if len(to_users) == 1:
        # invite recipient already has an account

        new_invite.friendee_id = to_users[0].id
        db.session.add(new_invite)
        db.session.commit()

        msg = Message("Friend Request from " + inviter_name, recipients=[to_email])
        msg.body = inviter_name + " has invited you to be friends on Nash! \n\nPlease visit " + confirm_friend_url + " to confirm the friend request. \n\nThanks,\n- Nash"
        mail.send(msg)

    else:
        # invite recipient does NOT already have an account, will need to join Nash

        new_invite.friendee_email = to_email
        db.session.add(new_invite)
        db.session.commit()

        msg = Message("Invite from " + inviter_name + " to Nash", recipients=[to_email])

        msg.body = inviter_name + " has invited you to be friends on Nash, a tool for reality testing. \n\nPlease visit " + register_url + " to sign up for Nash! \n\nYou can then visit " + confirm_friend_url + " confirm the friend request. \n\nThanks,\n- Nash"
        mail.send(msg)


    return jsonify(result="success")



@app.route('/_confirm_friend', methods=['POST'])
@login_required
def confirm_friend():
    data = json.loads(request.data)
    friend_id = data['friend_id']

    friend = User.query.get(friend_id)

    # update confirmed_at for all invites with friender_id=friend_id
    # and target friend as current user

    FriendshipInvite.query.filter( \
                     (FriendshipInvite.friender_id==friend_id) & \
                     (FriendshipInvite.confirmed_at==None) & \
                     ((FriendshipInvite.friendee_id==current_user.id) | \
                      (FriendshipInvite.friendee_email==current_user.email))).\
               update({FriendshipInvite.confirmed_at: datetime.datetime.utcnow()})

    # add to actual friends list for both current_user & friend

    friendship = Friendship()
    friendship.friender = current_user
    friendship.friendee = friend

    friendship_mutual = Friendship()
    friendship_mutual.friender = friend
    friendship_mutual.friendee = current_user

    # save all changes
    db.session.commit()

    return jsonify(result="success")



@app.route('/pages/profile', methods=['GET', 'POST'])
@login_required
def user_profile_page():
    # Initialize form
    form = UserProfileForm(CombinedMultiDict((request.files, request.form)), current_user)

    # Process valid POST
    if request.method == 'POST' and form.validate():
        # Save photo
        if form.photo.data.filename != "" :
            f = form.photo.data
            img = process_profile_picture(f.stream)
            orig_filename, file_extension = os.path.splitext(f.filename)
            filename = str(uuid.uuid4()) + file_extension
            img.save(os.path.join(
                app.instance_path, 'photos', filename
            ))
            current_user.photo_file_name = filename

        # Copy form fields to user_profile fields
        form.populate_obj(current_user)

        # Save user_profile
        db.session.commit()

        flash('Profile updated successfully.', 'success')

    # Process GET or invalid POST
    return render_template('pages/user_profile_page.html',
                           form=form)
