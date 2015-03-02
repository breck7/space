var fs = require('fs'),
    Space = require('space'),
    beautify = require('js-beautify').js_beautify,
  	pack = new Space(fs.readFileSync('package.space', 'utf8')),
	v = pack.get('version').split(/\./g),
	version = process.argv[2] ? process.argv[2] : [v[0],v[1],parseFloat(v[2]) + 1].join('.')

pack.set('version', version)
fs.writeFileSync('package.space', pack.toString(), 'utf8')
fs.writeFileSync('package.json', beautify(pack.toJSON(), { indent_size: 2 }), 'utf8')

var js = fs.readFileSync('space.js', 'utf8').replace(/Space\.version.*/, "Space.version = \"" + version + "\"")
fs.writeFileSync('space.js', js, 'utf8')
console.log('Updated to version %s', version)
