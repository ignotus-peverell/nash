# Copyright 2014 SolidBuilds.com. All rights reserved
#
# Authors: Ling Thio <ling.thio@gmail.com>

from flask_uploads import UploadSet, IMAGES, configure_uploads
from flask_user import UserMixin
from flask_user.forms import RegisterForm
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, SubmitField, validators
from app.init_app import db, app

class Friendship(db.Model):
    __tablename__ = 'friendships'
    id = db.Column(db.Integer(), primary_key=True)
    friender_id = db.Column(db.Integer(), db.ForeignKey('users.id', ondelete='CASCADE'))
    friendee_id = db.Column(db.Integer(), db.ForeignKey('users.id', ondelete='CASCADE'))
    friender = db.relationship("User", foreign_keys=[friender_id],
                               back_populates="friendships")

    friendee = db.relationship("User", foreign_keys=[friendee_id],
                               back_populates="cofriendships")
    

# Define the User data model. Make sure to add the flask_user.UserMixin !!
class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)

    # User authentication information (required for Flask-User)
    email = db.Column(db.Unicode(255), nullable=False, server_default=u'', unique=True)
    confirmed_at = db.Column(db.DateTime())
    password = db.Column(db.String(255), nullable=False, server_default='')
    # reset_password_token = db.Column(db.String(100), nullable=False, server_default='')
    active = db.Column(db.Boolean(), nullable=False, server_default='0')

    # User information
    active = db.Column('is_active', db.Boolean(), nullable=False, server_default='0')
    first_name = db.Column(db.Unicode(50), nullable=False, server_default=u'')
    last_name = db.Column(db.Unicode(50), nullable=False, server_default=u'')
    photo_file_name = db.Column('photo_file_name',db.String(260), nullable=True, server_default=u'')

    # Relationships
    roles = db.relationship('Role', secondary='users_roles',
                            backref=db.backref('users', lazy='dynamic'))

    friendships = db.relationship('Friendship', foreign_keys=[Friendship.friender_id])
    cofriendships = db.relationship('Friendship', foreign_keys=[Friendship.friendee_id])

 
# Define the Role data model
class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(50), nullable=False, server_default=u'', unique=True)  # for @roles_accepted()
    label = db.Column(db.Unicode(255), server_default=u'')  # for display purposes
    

class Graph(db.Model):
    __tablename__ = 'graphs'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(50), nullable=False, server_default=u'')
    description = db.Column(db.String(1000), nullable=False, server_default=u'')
    nodes = db.Column(db.String(10 * 1000), nullable=False, server_default=u'')
    edges = db.Column(db.String(10 * 1000), nullable=False, server_default=u'')

    # Relationships
    owners = db.relationship('User', secondary='users_graphs_owner', backref=db.backref('graphs_owned', lazy='dynamic'))
    helpers = db.relationship('User', secondary='users_graphs_helpers', backref=db.backref('graphs_helping', lazy='dynamic'))


# Define the UserRoles association model
class UsersRoles(db.Model):
    __tablename__ = 'users_roles'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('users.id', ondelete='CASCADE'))
    role_id = db.Column(db.Integer(), db.ForeignKey('roles.id', ondelete='CASCADE'))


class UsersGraphsOwner(db.Model):
    __tablename__ = 'users_graphs_owner'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('users.id', ondelete='CASCADE'))
    graph_id = db.Column(db.Integer(), db.ForeignKey('graphs.id', ondelete='CASCADE'))


class UsersGraphsHelpers(db.Model):
    __tablename__ = 'users_graphs_helpers'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('users.id', ondelete='CASCADE'))
    graph_id = db.Column(db.Integer(), db.ForeignKey('graphs.id', ondelete='CASCADE'))


class UsersFriendships(db.Model):
    __tablename__ = 'users_friendships'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('users.id', ondelete='CASCADE'))
    friendship_id = db.Column(db.Integer(), db.ForeignKey('friendships.id', ondelete='CASCADE'))


# Define the User registration form
# It augments the Flask-User RegisterForm with additional fields
class MyRegisterForm(RegisterForm):
    first_name = StringField('First name', validators=[
        validators.DataRequired('First name is required')])
    last_name = StringField('Last name', validators=[
        validators.DataRequired('Last name is required')])


# Define the User profile form
class UserProfileForm(FlaskForm):
    first_name = StringField('First name', validators=[
        validators.DataRequired('First name is required')])
    last_name = StringField('Last name', validators=[
        validators.DataRequired('Last name is required')])
    images = UploadSet('images', IMAGES)
    configure_uploads(app, (images,))
    photo = FileField('Profile Picture', validators=[FileAllowed(images, 'Images only!')])
    submit = SubmitField('Save')


class FriendForm(FlaskForm):
    email = StringField('Email', validators=[
        validators.DataRequired('Email is required')])
    submit = SubmitField('Add')
