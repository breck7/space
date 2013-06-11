#!/usr/bin/env node
var Space = require('space'),
    fs = require('fs'),
    mime = require('mime'),
    Path = require('path'),
    SpaceFS = require('./spacefs/spacefs.js')

if (process.argv.length < 3) {
  console.log('Usage: space someFolder [destination] OR space someFile.space [destination]')
  process.exit()
}

var arg1 = SpaceFS.resolvePath(process.argv[2])
var arg2 = null
if (process.argv.length > 3)
  arg2 = process.argv[3]

// Space to Folder
if (arg1.match(/\.space$/)) {

  var space = new Space(fs.readFileSync(arg1, 'utf8'))
  var path = arg2 || '.'
  path = SpaceFS.resolvePath(path)
  SpaceFS.spaceToFolder(path, space)

}

// Folder to Space
else {
  var folder = Path.dirname(arg1)
  var filename = arg2 || Path.basename(arg1) + '.space'
  var space = SpaceFS.folderToSpace(arg1)
  fs.writeFileSync(filename, space.toString(), 'utf8')
}