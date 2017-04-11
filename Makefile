env:
	virtualenv nashenv --no-site-packages
	. nashenv/bin/activate
	nashenv/bin/pip install -r requirements.txt
	ln -s nashenv/bin/activate .
	mkdir -p instance/photos
	cp app/static/images/default.png instance/photos/

clean:
	rm -rf nashenv
	rm -rf activate
	rm -rf instance
