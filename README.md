# Nash reality testing

The server code is currently only tested on Ubuntu 16.04 (Xenial).

To setup and start running:
* make env
* source activate
* python manage.pu initdb
* python manage.py runserver

To run the website so that it will be externally visible, do this:
* python manage.py runserver --host 0.0.0.0


[Flask-User-starter-app](https://github.com/lingthio/Flask-User-starter-app) was used as a starting point for this code repository.


