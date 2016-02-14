const qunit = require("qunit")

qunit.run({
	deps: {
		path: "./tests/testStrings.js",
		namespace: "testStrings"
	},
    code: {
		// Include the source code
		path: "./space.js",
		// What global var should it introduce for your tests?
		namespace: "Space"
    },
    tests: [
		// Include the test suite(s)
		"./tests/tests.js"
    ]
})
