all:
	java -jar ~/compiler.jar --js=space.js --js_output_file=space.min.js
	open tests/min.html

install:
	cd ..; sudo npm install -g space/; npm install space/

test:
	open tests/index.html

testmin:
	open tests/min.html

testnode:
	node tests/node-test.js

testfs:
	mocha spacefs/tests/test.js

.PHONY: test install testmin