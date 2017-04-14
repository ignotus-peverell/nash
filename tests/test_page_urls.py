# Copyright 2014 SolidBuilds.com. All rights reserved
#
# Authors: Ling Thio <ling.thio@gmail.com>

from __future__ import print_function  # Use print() instead of print
from flask import url_for
from StringIO import StringIO

def test_page_urls(client):
    # Visit landing page
    response = client.get(url_for('landing_page'))
    assert b'<h1>Not sure' in response.data

    # Login as user and visit User page
    response = client.post(url_for('user.login'), follow_redirects=True,
                           data=dict(email='user@example.com', password='Password1'))
    assert b'<h1>Welcome</h1>' in response.data
    response = client.get(url_for('user_page', id=2))
    assert b'<h1>User Example</h1>' in response.data

    # Edit User Profile page
    response = client.get(url_for('user_profile_page'))
    assert b'<h1>User Profile</h1>' in response.data
    f = open('app/static/images/default.png')
    lines = "".join(f.readlines())
    f.close()
    response = client.post(url_for('user_profile_page'), follow_redirects=True,
                           data=dict(first_name='User', last_name='User',
                                     photo=(StringIO(lines),
                                            'test.png')))

    response = client.get(url_for('user_page', id=2))
    assert b'<h1>User User</h1>' in response.data

    # Logout
    response = client.get(url_for('user.logout'), follow_redirects=True)
    assert b'<h1>Sign in</h1>' in response.data

    # Login as admin and visit Admin page
    response = client.post(url_for('user.login'), follow_redirects=True,
                           data=dict(email='admin@example.com', password='Password1'))
    assert b'<h1>Welcome</h1>' in response.data
    response = client.get(url_for('admin_page'))
    assert b'<h1>Admin page</h1>' in response.data

    # Logout
    response = client.get(url_for('user.logout'), follow_redirects=True)
    assert b'<h1>Sign in</h1>' in response.data
