# This file defines command line commands for manage.py
#
# Copyright 2014 SolidBuilds.com. All rights reserved
#
# Authors: Ling Thio <ling.thio@gmail.com>

import datetime
import cPickle as pickle

from app.init_app import app, db, manager
from app.models import User, Role, Graph, GraphRevision, GraphViewRevision

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
    user = find_or_create_user(u'Admin', u'Example', u'admin@example.com', 'Password1', admin_role)
    user = find_or_create_user(u'User', u'Example', u'user@example.com', 'Password1')

    # Save to DB
    db.session.commit()


def find_or_create_role(name, label):
    """ Find existing role or create new role """
    role = Role.query.filter(Role.name == name).first()
    if not role:
        role = Role(name=name, label=label)
        db.session.add(role)
    return role


def find_or_create_user(first_name, last_name, email, password, role=None):
    """ Find existing user or create new user """
    user = User.query.filter(User.email == email).first()
    if not user:
        user = User(email=email,
                    first_name=first_name,
                    last_name=last_name,
                    password=app.user_manager.hash_password(password),
                    active=True,
                    confirmed_at=datetime.datetime.utcnow())
        if role:
            user.roles.append(role)
        db.session.add(user)
    return user


def add_tutorial_graphs():
    nodes = [{u'detailed': u'The grass is wet.', u'index': 0, u'locked': True,
              u'weight': 1, u'self_causing': True, u'px': 508, u'py': 356,
              u'label': u'Wet Grass', u'self_cause_weird': u'3', u'truth': True,
              u'y': 356, u'x': 508, u'id': 1},
             {u'detailed': u'It rained yesterday.', u'index': 1, u'weight': 2,
              u'self_causing': False, u'px': 327, u'py': 431, u'label': u'Rain',
              u'self_cause_weird': u'0', u'y': 431, u'x': 327, u'id': 2},
             {u'detailed': u'I remember it raining yesterday.', u'index': 2,
              u'locked': True, u'weight': 1, u'self_causing': False, u'px': 380,
              u'py': 242, u'label': u'Memory', u'self_cause_weird': u'3',
              u'y': 242, u'x': 380, u'id': 3}]
    edges = [{u'detailed': u'If it rained yesterday, I would remember it',
              u'target': 2, u'source': 1, u'meaning': u'cause',
              u'cause_weird': u'3', u'prevent_weird': u'0'},
             {u'detailed': u'If it rained yesterday, the grass will be wet.',
              u'target': 0, u'source': 1, u'meaning': u'cause',
              u'cause_weird': u'3', u'prevent_weird': u'0'}]

    user = User.query.filter(User.email == u'user@example.com').first()
    admin = User.query.filter(User.email == u'admin@example.com').first()
    
    revision = GraphRevision(nodes=pickle.dumps(nodes),
                             edges=pickle.dumps(edges),
                             timestamp=datetime.datetime.now())
    view = GraphViewRevision(nodes=pickle.dumps(nodes),
                             edges=pickle.dumps(edges),
                             timestamp=datetime.datetime.now())

    db.session.commit()
    
    graph = Graph(name='tutorial1',
                  description='Why is the grass wet?',
                  owners=[user],
                  helpers=[admin],
                  revisions=[revision],
    )

    db.session.commit()

    graph.current_revision = revision

    db.session.commit()
