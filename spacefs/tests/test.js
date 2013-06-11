var assert = require('assert'),
    SpaceFS = require('../spacefs.js'),
    fs = require('fs'),
    Space = require('Space'),
    exec = require('child_process').exec



describe('isText', function(){
  it('should return false when the given file is an image', function(){
    assert.equal(false, SpaceFS.isText('sample.png'))
    assert.equal(false, SpaceFS.isText('sample.jpg'))
    assert.equal(false, SpaceFS.isText('sample.jpeg'))
  })
  it('should return true when the given file is text', function(){
    assert.equal(true, SpaceFS.isText('sample.txt'))
    assert.equal(true, SpaceFS.isText('sample.html'))
    assert.equal(true, SpaceFS.isText('sample.js'))
  })
})

describe('resolvePath', function(){
  it('should return full path', function(){
    // todo: how do you test this in diff envs?
    assert.notEqual('~/foobar', SpaceFS.resolvePath('~/foobar'))
  })
})

describe('folderToSpace', function(){
  
  var space = SpaceFS.folderToSpace(__dirname)
  var filename = 'temp.space'
  fs.writeFileSync(filename, space.toString(), 'utf8')
  var data = new Space(fs.readFileSync(filename, 'utf8'))
  
  it('should have encoded text files', function(){
    assert.equal('4', data.get('four.txt'))
  })
  
  it('should not encode non existent things', function(){
    assert.equal(undefined, data.get('undefined.txt'))
  })
  
  it('should have base64 encoded images', function(){
    assert.equal(true, !!data.get('sample.png').match(/\=\=$/))
  })
  
  it('should not have base64 encoded text files', function(){
    assert.equal(false, !!data.get('four.txt').match(/\=\=$/))
  })
  
  fs.unlinkSync(filename)
})


describe('spaceToFolder', function(){

  var space = new Space('world.txt Woot!\n')
  var dirName = __dirname + '/temp/'
  SpaceFS.spaceToFolder(dirName, space)
  
  it('should have created the temp folder', function(){
    assert.equal(true, fs.existsSync(dirName))
  })
  
  it('should have created the world.txt file', function(){
    assert.equal(true, fs.existsSync(dirName + 'world.txt'))
    assert.equal('Woot!', fs.readFileSync(dirName + 'world.txt', 'utf8'))
  })
  
  after(function () {
    exec('rm -rf ' + dirName)  
  })
  
})


