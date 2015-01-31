all:
	java -jar ~/compiler.jar --js=space.js --js_output_file=space.min.js
	open tests/min.html

beautify:
	js-beautify -f space.js -r -s 2

install:
	cd ..; sudo npm install -g space/; npm install space/

nodeperf:
	node tests/node-perf-test.js

perf:
	open tests/perf.html

publish:
	npm publish

test:
	open tests/index.html

testmin:
	open tests/min.html

testnode:
	node tests/node-test.js

testfs:
	mocha spacefs/tests/test.js

version:
	node version.js

.PHONY: test install testmin