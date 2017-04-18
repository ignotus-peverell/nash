# This file defines command line commands for manage.py
#
# Copyright 2014 SolidBuilds.com. All rights reserved
#
# Authors: Ling Thio <ling.thio@gmail.com>

import datetime
import cPickle as pickle

from app.init_app import app, db, manager
from app.models import (User, Role, Graph, GraphRevision, GraphViewRevision,
                        Friendship)

@manager.command
def init_db():
    """ Initialize the database."""
    # Create all tables
    db.create_all()
    # Add all Users
    add_users()

    # add tutorial graphs
    add_tutorial_graphs()

def add_users():
    """ Create users when app starts """


    # Adding roles
    admin_role = find_or_create_role('admin', u'Admin')

    # Add users
    admin = find_or_create_user(u'Admin', u'Example', u'admin@example.com', 'Password1', admin_role)
    user = find_or_create_user(u'User', u'Example', u'user@example.com', 'Password1')
    helper1 = find_or_create_user(u'Helper1', u'Example', u'helper1@example.com', 'Password1')
    helper2 = find_or_create_user(u'Helper2', u'Example', u'helper2@example.com', 'Password1')

    cinderella = find_or_create_user(u'Cinderella', u'', u'cinderella@gmail.com',
                                     'Password1', photo='cinderella.png')
    evil_stepsister = find_or_create_user(u'Evil', u'Stepsister',
                                          u'evil.stepsister@gmail.com',
                                          'Password1', photo='evil-stepsister.png')
    prince_charming = find_or_create_user(u'Prince', u'Charming',
                                          u'prince.charming@palace.gov',
                                          'Password1', photo='prince-charming.png')
    
    friendships = [
        Friendship(friender=user, friendee=helper1),
        Friendship(friender=helper1, friendee=user),
        Friendship(friender=user, friendee=helper2),
        Friendship(friender=helper2, friendee=user),
        Friendship(friender=user, friendee=admin),
        Friendship(friender=admin, friendee=user),
        ]
    
    # Save to DB
    db.session.commit()


def find_or_create_role(name, label):
    """ Find existing role or create new role """
    role = Role.query.filter(Role.name == name).first()
    if not role:
        role = Role(name=name, label=label)
        db.session.add(role)
    return role


def find_or_create_user(first_name, last_name, email, password, role=None,
                        photo='default.png'):
    """ Find existing user or create new user """
    user = User.query.filter(User.email == email).first()
    if not user:
        user = User(email=email,
                    first_name=first_name,
                    last_name=last_name,
                    password=app.user_manager.hash_password(password),
                    photo_file_name=photo,
                    active=True,
                    confirmed_at=datetime.datetime.utcnow())
        if role:
            user.roles.append(role)
        db.session.add(user)
    return user


def add_grass_graph():
    nodes = [{u'detailed': u'The grass is wet.', u'index': 0, u'locked': True,
              u'label': u'Wet Grass', u'self_cause_weird': u'3',
              u'y': 356, u'x': 508, u'id': 1},
             {u'detailed': u'It rained yesterday.', u'index': 1,
              u'label': u'Rain',
              u'self_cause_weird': u'0', u'y': 431, u'x': 327, u'id': 2},
             {u'detailed': u'I remember it raining yesterday.', u'index': 2,
              u'locked': True,
              u'label': u'Memory', u'self_cause_weird': u'3',
              u'y': 242, u'x': 380, u'id': 3}]
    subj_nodes_user = [{u'index': 0, u'self_cause_weird': u'3',
                        u'truth': True, u'id': 1},
                       {u'index': 1, u'self_cause_weird': u'0',
                        u'truth': False, u'id': 2},
                       {u'index': 2, u'self_cause_weird': u'3',
                        u'truth': False, u'id': 3}]
    subj_nodes_helper1 = [{u'index': 0, u'self_cause_weird': u'1',
                           u'truth': True, u'id': 1},
                          {u'index': 1, u'self_cause_weird': u'0',
                           u'truth': False, u'id': 2},
                          {u'index': 2, u'self_cause_weird': u'3',
                           u'truth': False, u'id': 3}]
    subj_nodes_helper2 = [{u'index': 0, u'self_cause_weird': u'1',
                           u'truth': True, u'id': 1},
                          {u'index': 1, u'self_cause_weird': u'0',
                           u'truth': True, u'id': 2},
                          {u'index': 2, u'self_cause_weird': u'3',
                           u'truth': False, u'id': 3}]
    edges = [{u'detailed': u'If it rained yesterday, I would remember it',
              u'target': 2, u'source': 1, u'meaning': u'cause'},
             {u'detailed': u'If it rained yesterday, the grass will be wet.',
              u'target': 0, u'source': 1, u'meaning': u'cause'}]
    subj_edges_user = [
        {u'target': 2, u'source': 1,
         u'cause_weird': u'3', u'prevent_weird': u'0'},
        {u'target': 0, u'source': 1,
         u'cause_weird': u'3', u'prevent_weird': u'0'}]
    subj_edges_helper1 = [
        {u'target': 2, u'source': 1,
         u'cause_weird': u'3', u'prevent_weird': u'0'},
        {u'target': 0, u'source': 1,
         u'cause_weird': u'3', u'prevent_weird': u'0'}]
    subj_edges_helper2 = [
        {u'target': 2, u'source': 1,
         u'cause_weird': u'3', u'prevent_weird': u'0'},
        {u'target': 0, u'source': 1,
         u'cause_weird': u'3', u'prevent_weird': u'0'}]

    user = User.query.filter(User.email == u'user@example.com').first()
    helper1 = User.query.filter(User.email == u'helper1@example.com').first()
    helper2 = User.query.filter(User.email == u'helper2@example.com').first()
    admin = User.query.filter(User.email == u'admin@example.com').first()
    
    revision = GraphRevision(nodes=pickle.dumps(nodes),
                             edges=pickle.dumps(edges),
                             timestamp=datetime.datetime.now(),
                             author=user)
    view_user = GraphViewRevision(nodes=pickle.dumps(subj_nodes_user),
                                  edges=pickle.dumps(subj_edges_user),
                                  timestamp=datetime.datetime.now(),
                                  author=user)
    view_helper1 = GraphViewRevision(nodes=pickle.dumps(subj_nodes_helper1),
                                     edges=pickle.dumps(subj_edges_helper1),
                                     timestamp=datetime.datetime.now(),
                                     author=helper1)
    view_helper2 = GraphViewRevision(nodes=pickle.dumps(subj_nodes_helper2),
                                     edges=pickle.dumps(subj_edges_helper2),
                                     timestamp=datetime.datetime.now(),
                                     author=helper2)

    db.session.commit()
    
    graph = Graph(name='tutorial1',
                  description='Why is the grass wet?',
                  public=True,
                  owners=[user],
                  helpers=[helper1, helper2],
                  revisions=[revision],
                  views=[view_user, view_helper1, view_helper2],
    )

    db.session.commit()

    graph.current_revision = revision

    db.session.commit()


def add_cinderella_graph():
    nodes = [{u'detailed': u'Cinderella went to the ball.',
              u'index': 0,
              u'label': u'Cinderella at ball',
              u'y': 300, u'x': 400, u'id': 1},
             {u'detailed':
              u"Cinderella's fairy godmother made her a lovely magic dress.",
              u'index': 1,
              u'label': u'Magic dress',
              u'y': 300, u'x': 300, u'id': 2},
             {u'detailed': u'Cinderella dropped her glass slipper.',
              u'index': 2,
              u'label': u'Dropped slipper',
              u'y': 300, u'x': 500, u'id': 3},
             {u'detailed': u"The glass slipper fits Cinderella's foot.",
              u'index': 3, u'locked': True,
              u'label': u'Slipper fits',
              u'y': 300, u'x': 600, u'id': 4}
    ]
    subj_nodes_cinderella = [
        {u'index': 0, u'self_cause_weird': u'3',
         u'truth': True},
        {u'index': 1, u'self_cause_weird': u'3',
         u'truth': True},
        {u'index': 2, u'self_cause_weird': u'3',
         u'truth': True},
        {u'index': 3, u'self_cause_weird': u'3',
         u'truth': True}
    ]
    subj_nodes_evil_stepsister = [
        {u'index': 0, u'self_cause_weird': u'3',
         u'truth': False},
        {u'index': 1, u'self_cause_weird': u'3',
         u'truth': False},
        {u'index': 2, u'self_cause_weird': u'3',
         u'truth': False},
        {u'index': 3, u'self_cause_weird': u'3',
         u'truth': True}
    ]
    subj_nodes_prince_charming = [
        {u'index': 0, u'self_cause_weird': u'3',
         u'truth': True},
        {u'index': 1, u'self_cause_weird': u'3',
         u'truth': False},
        {u'index': 2, u'self_cause_weird': u'3',
         u'truth': True},
        {u'index': 3, u'self_cause_weird': u'3',
         u'truth': True}
    ]
        
    edges = [{u'detailed': u'Cinderella needed a lovely dress to go to the ball.',
              u'target': 0, u'source': 1, u'meaning': u'cause'},
             {u'detailed': u"Cinderella couldn't have dropped her slipper at the ball if she wasn't there",
              u'target': 2, u'source': 0, u'meaning': u'cause'},
             {u'detailed': u"The glass slipper wouldn't fit unless it was the one Cinderella dropped.",
              u'target': 3, u'source': 2, u'meaning': u'cause'}
    ]
    subj_edges_cinderella = [
        {u'target': 2, u'source': 1,
         u'cause_weird': u'3', u'prevent_weird': u'0'},
        {u'target': 0, u'source': 1,
         u'cause_weird': u'3', u'prevent_weird': u'0'}]
    subj_edges_evil_stepsister = subj_edges_cinderella
    subj_edges_prince_charming = subj_edges_cinderella
    
    cinderella = User.query.filter(User.email == u'cinderella@gmail.com').first()
    evil_stepsister = User.query.filter(User.email == u'evil.stepsister@gmail.com').first()
    prince_charming = User.query.filter(User.email == u'prince.charming@palace.gov').first()
    
    revision = GraphRevision(nodes=pickle.dumps(nodes),
                             edges=pickle.dumps(edges),
                             timestamp=datetime.datetime.now(),
                             author=cinderella)
    view_cinderella = GraphViewRevision(nodes=pickle.dumps(subj_nodes_cinderella),
                                        edges=pickle.dumps(subj_edges_cinderella),
                                        timestamp=datetime.datetime.now(),
                                        author=cinderella)
    view_evil_stepsister = GraphViewRevision(nodes=pickle.dumps(subj_nodes_evil_stepsister),
                                             edges=pickle.dumps(subj_edges_evil_stepsister),
                                             timestamp=datetime.datetime.now(),
                                             author=evil_stepsister)
    view_prince_charming = GraphViewRevision(nodes=pickle.dumps(subj_nodes_prince_charming),
                                     edges=pickle.dumps(subj_edges_prince_charming),
                                     timestamp=datetime.datetime.now(),
                                             author=prince_charming)

    db.session.commit()
    
    graph = Graph(name='Cinderella',
                  description='Cinderella',
                  public=True,
                  owners=[cinderella],
                  helpers=[evil_stepsister, prince_charming],
                  revisions=[revision],
                  views=[view_cinderella, view_evil_stepsister,
                         view_prince_charming],
    )

    db.session.commit()

    graph.current_revision = revision

    db.session.commit()


def add_tutorial_graphs():
    add_grass_graph()
    add_cinderella_graph()

