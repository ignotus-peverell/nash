env:
	npm install
	virtualenv nashenv --no-site-packages
	. nashenv/bin/activate
	nashenv/bin/pip install -r requirements.txt
	ln -s nashenv/bin/activate .
	mkdir -p instance/photos
	cp app/static/images/default_users/* instance/photos/

clean:
	rm -rf node_modules
	rm -rf nashenv
	rm -rf activate
	rm -rf instance
