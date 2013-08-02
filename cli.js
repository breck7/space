#!/usr/bin/env node
var Space = require('space'),
    fs = require('fs'),
    mime = require('mime'),
    Path = require('path'),
    SpaceFS = require('./spacefs/spacefs.js')

if (process.argv.length < 3) {
  console.log('Usage: space someFolder [destination] [ignoreRegex] OR space someFile.space [destination]')
  process.exit()
}

var arg1 = SpaceFS.resolvePath(process.argv[2])
var arg2
var arg3

if (process.argv.length > 3)
  arg2 = process.argv[3]

if (process.argv.length > 4)
  arg3 = process.argv[4]

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
  
  var options = new Space()
  if (arg3)
    options = new Space(fs.readFileSync(arg3, 'utf8'))
  
  var space = SpaceFS.folderToSpace(arg1, options)
  fs.writeFileSync(filename, space.toString(), 'utf8')
}