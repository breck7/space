all: build testmin testnode

beautify:
	js-beautify -f space.js -r -s 2

build:
	java -jar ~/compiler.jar --compilation_level=SIMPLE --language_out=ECMASCRIPT5 --js=space.js --js_output_file=space.min.js

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

testnodemin:
	node tests/node-test-min.js

version:
	node version.js

.PHONY: test install testmin
