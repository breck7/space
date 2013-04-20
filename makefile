install:
	cd ..; sudo npm install -g space/; npm install space/

test:
	open tests/index.html

testmin:
	open tests/min.html

package:
	java -jar ~/compiler.jar --js=space.js --js_output_file=space.min.js
	open tests/min.html

.PHONY: test build lint install testmin