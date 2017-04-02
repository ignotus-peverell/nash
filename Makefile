env:
	virtualenv nashenv --no-site-packages
	. nashenv/bin/activate
	nashenv/bin/pip install -r requirements.txt
	ln -s nashenv/bin/activate .
	./activate
clean:
	rm -rf nashenv
