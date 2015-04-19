all:
	java -jar ~/compiler.jar --js=space.js --js_output_file=space.min.js
	open tests/min.html
	node tests/node-test.js

beautify:
	js-beautify -f space.js -r -s 2

install:
	cd ..; sudo npm install -g space/; npm install space/

perf:
	open tests/perf.html; node --expose-gc tests/perf.js;

publish:
	npm publish

speedcoach:
	cp ~/speedcoach/speedcoach.js tests/speedcoach.js

test:
	open tests/index.html

testmin:
	open tests/min.html

testnode:
	node tests/node-test.js

version:
	node version.js

.PHONY: test install testmin