function Space(properties) {
  
  this.keys = []
  this.values = {}

  // Load from string
  if (typeof properties === 'string')
    return this.loadFromString(properties)
  
  // Load from Space object
  if (properties instanceof Space) {
    this.keys = properties.keys
    for (var i in this.keys) {
      var key = this.keys[i]
      this.values[key] = properties.values[key]
    }
    return this
  }
  
  // Load from object
  for (var key in properties) {
    if (!properties.hasOwnProperty(key))
      continue
    var value = properties[key]
    if (typeof value === 'object')
      this.set(key, new Space(value))
    else
      this.set(key, value)
  }
  return this
}

/**
 * @param {string}
 * @param {int}
 * @return {string}
 */
Space.strRepeat = function (string, count) {
  var str = ''
  for (var i = 0; i < count; i++) {
    str += ' '
  }
  return str
}

/**
 * Return a new Space with the key/value pairs that all passed spaces contain.
 * space: will probably be removed.
 * @param {array} Array of Spaces
 * @return {Space}
 */
Space.union = function () {
  var union = Space.unionSingle(arguments[0], arguments[1])
  for (var i in arguments) {
    if (i === 1) continue // skip the first one
    union = Space.unionSingle(union, arguments[i])
    if (!union.keys.length) break
  }
  return union
}

/**
 * space: will probably be removed.
 * @param {Space}
 * @return {Space}
 */
Space.unionSingle = function(spaceA, spaceB) {
  var union = new Space()
  if (!(spaceB instanceof Space))
    return union
  for (var i in spaceA.keys) {
    var key = spaceA.keys[i]
    var value = spaceA.values[key]
    if (value instanceof Space && spaceB.values[key] && spaceB.values[key] instanceof Space)
      union.set(key, Space.unionSingle(value, spaceB.values[key]))
    if (value === spaceB.values[key])
      union.set(key, value)
  }
  return union
}

Space.prototype.keys = []
Space.prototype.values = {}


/**
 * Deletes all keys and values.
 * @return this
 */
Space.prototype.clear = function () {
  this.keys = []
  this.values = {}
  return this
}

/**
 * Returns a deep copied space.
 * @return {Space}
 */
Space.prototype.clone = function () {
  return new Space(this.toString())
}

Space.prototype['delete'] = function (key) {
  if (!key.match(/ /)) {
    var index = this.keys.indexOf(key)
    if (index === -1)
      return this
    this.keys.splice(index, 1)
    delete this.values[key]
    return this
  }
  // Get parent
  var parts = key.split(/ /)
  var child = parts.pop()
  var parent = this.get(parts.join(' '))
  if (parent instanceof Space) {
    parent['delete'](child)
  }
  return this
}

/**
 * Returns the difference between 2 spaces. The difference between 2 spaces is a space.
 *
 * b == a.patch(a.diff(b))
 *
 * todo: clean and refactor this.
 *
 * @param {Space} The space to compare the instance against.
 * @return {Space}
 */
Space.prototype.diff = function (space) {

  var diff = new Space()
  
  if (!(space instanceof Space))
    space = new Space(space)
  
  for (var i in this.keys) {
    
    var key = this.keys[i]
    var value = space.values[key]
    // Case: Deleted
    if (typeof value === 'undefined') {
      diff.set(key, '')
      continue
    }
    // Different Types
    if (typeof(this.values[key]) !== typeof(value)) {
      if (typeof value === 'object')
        diff.set(key, new Space(value))
      
      // We treat a value of 1 equal to '1'
      else if (this.values[key] == value)
        continue
      else
        diff.set(key, value)
      continue
    }
    // Strings, floats, etc
    if (typeof(this.values[key]) !== 'object') {
      if (this.values[key] != value)
        diff.set(key, value)
      continue
    }
    // Both are Objects
    var sub_diff = this.values[key].diff(value)
    if (sub_diff.keys.length)
      diff.set(key, sub_diff)
  }
  // Leftovers are Additions
  for (var i in space.keys) {
    var key = space.keys[i]
    var value = space.values[key]
    if (this.values[key])
      continue
    if (typeof value !== 'object') {
      diff.set(key, value)
      continue
    }
    else if (value instanceof Space)
      diff.set(key, new Space(value))
    else
      diff.set(key, new Space(space))
  }
  return diff
}

/**
 * @param {space}
 * @return {space} Returns empty space if order is equal.
 */
Space.prototype.diffOrder = function (space) {

  if (!(space instanceof Space))
    space = new Space(space)
  var diff = new Space()
  for (var i in space.keys) {
    var key = space.keys[i]
    var value = space.values[key]
    if (!(value instanceof Space) || !(this.values[key] instanceof Space))
      continue
    var childDiff = this.values[key].diffOrder(value)
    if (childDiff.empty())
      continue
    diff.set(key, childDiff)
  }
  // Parent hasnt changed
  if (space.keys.join(' ') === this.keys.join(' '))
    return diff
  // Parent has changed
  diff.keys = space.keys
  for (var i in space.keys) {
    var key = space.keys[i]
    if (!diff.values.hasOwnProperty(key))
      diff.values[key] = new Space()
  }
  return diff
}

Space.prototype.each = function (fn) {
  for (var i in this.keys) {
    fn.call(this, this.keys[i], this.values[this.keys[i]])
  }
  return this
}

Space.prototype.empty = function () {
  return this.keys.length === 0
}

Space.prototype.every = function (fn) {
  for (var i in this.keys) {
    var value = this.values[this.keys[i]]
    if (value instanceof Space)
      value.every(fn)
    fn.call(this, this.keys[i], this.values[this.keys[i]])
  }
  return this
}

/**
 * Search the space for a given path (xpath).
 * @param {string|int|space}
 * @param {space}
 * @return The matching value
 */
Space.prototype.get = function (query) {
  switch (typeof query) {
    case "string":
      return this.getByString(query)
    break
    case "object":
      return this.getBySpace(query)
    break
    case "number":
      return this.getByInt(query)
    break
  }
  return null
}

/**
 * @param {int}
 * @return The matching value
 */
Space.prototype.getByInt = function (index) {
  if (index < 0)
    index = this.keys.length + index
  var key = this.keys[index]
  return this.values[key]
}

/**
 * Search the space for a given path (xpath).
 * @param {string}
 * @return The matching value
 */
Space.prototype.getByString = function (xpath) {
  
  if (!xpath)
    return null
  if (!xpath.match(/ /))
    return this.values[xpath]
  var parts = xpath.split(/ /g)
  var current = parts.shift()
  
  // Not set
  if (!(current in this.values))
    return null
  
  return this.values[current].get(parts.join(' '))
}

/**
 * Recursively retrieve properties.
 * @param {space} 
 * @return Space
 */
Space.prototype.getBySpace = function (space) {
  var result = new Space()
  
  for (var i in space.keys) {
    var key = space.keys[i]
    var value = this.values[key]
    
    // If this doesnt have that property, continue
    if (typeof value === 'undefined')
      continue
    
    // If the request is a leaf or empty space, set
    if (!(space.values[key] instanceof Space) || !space.values[key].keys.length) {
      result.set(key, value)
      continue
    }
    
    // Else the request is a space with keys, make sure the subject is a space
    if (!(value instanceof Space))
      continue
    
    // Now time to recurse
    result.set(key, value.getBySpace(space.values[key]))
  }
  return result 
}

/**
 * @return int
 */
Space.prototype.length = function () {
  return this.keys.length
}

/**
 * Construct the Space from a string.
 * @param {string}
 * @return {Space}
 */
Space.prototype.loadFromString = function (string) {
  
  // Space always start on a key. Eliminate whitespace at beginning of string
  string = string.replace(/^[\n ]*/, '')
  
  /** Eliminate Windows \r characters and newlines at end of string.*/
  string = string.replace(/\n\r/g, '\n').replace(/\r\n/g, '\n')
  
  /** Eliminate newlines at end of string.*/
  string = string.replace(/[\n ]*$/, '')
  
  /** Space doesn't have useless lines*/
  string = string.replace(/\n\n+/, '\n')
  
  // Workaround for browsers without negative look ahead
  /*
  var spaces_without_delimiter = string.split(/\n([^ ])/),
      spaces = [spaces_without_delimiter[0]]
  
  // Now we recombine spaces.
  for (var i = 1; i < spaces_without_delimiter.length; i = i + 2) {
    spaces.push(spaces_without_delimiter[i] + spaces_without_delimiter[i+1])
  }
  */
  var spaces = string.split(/\n(?! )/g)
  
  for (var i in spaces) {
    var space = spaces[i]
    if (matches = space.match(/^([^ ]+)(\n|$)/)) // Space
      this.set(matches[1], new Space(space.substr(matches[1].length).replace(/\n /g, '\n')))
    else if (matches = space.match(/^([^ ]+) /)) // Leaf
      this.set(matches[1], space.substr(matches[1].length + 1).replace(/^\n /, '').replace(/\n /g, '\n') )
  }
  return this
}

/**
 * Return the next name in the Space, given a name.
 * @param {string}
 * @return {string}
 */
Space.prototype.next = function (name) {
  var index = this.keys.indexOf(name) + 1
  if (this.keys[index])
    return this.keys[index]
  return this.keys[0]
}

/**
 * Apply a patch to the Space instance.
 * @param {Space|string}
 * @return {Space}
 */
Space.prototype.patch = function (patch) {
  
  if (!(patch instanceof Space))
    patch = new Space(patch)
  
  for (var i in patch.keys) {
    var key = patch.keys[i]
    var patchValue = patch.values[key]

    // If patch value is a string, doesnt matter what type subject is.
    if (typeof patchValue === 'string') {
      if (patchValue === '')
        this['delete'](key)
      else
        this.set(key, patchValue)
      continue
    }
    
    // If patch value is an int, doesnt matter what type subject is.
    if (typeof patchValue === 'number') {
      this.set(key, patchValue)
      continue
    }
    
    // If its an empty space, delete patch.
    if (patchValue instanceof Space && !patchValue.keys.length) {
      this['delete'](key)
      continue
    }
    
    // If both subject value and patch value are Spaces, do a recursive patch.
    if (this.values[key] instanceof Space) {
      this.values[key].patch(patchValue)
      continue
    }
    
    // Final case. Do a deep copy of space.
    this.set(key, new Space(patchValue))
  }
  return this
}

/**
 * Change the order of the keys
 * @param {array|string}
 * @return {this}
 */
Space.prototype.patchOrder = function (space) {
  
  if (!(space instanceof Space))
    space = new Space(space)
  
  // make sure space has all keys
  var keys = this.keys.length
  for (var i in space.keys) {
    var key = space.keys[i]
    // If the keys differ a bit, skip this level
    if (!this.values.hasOwnProperty(key))
      break
    keys--
  }
  if (keys === 0) {
    // Reorder this level.
    this.keys = space.keys
  }
  for (var i in space.keys) {
    var key = space.keys[i]
    var value = space.values[key]
    if (value instanceof Space && value.keys.length && this.values[key] instanceof Space)
      this.values[key].patchOrder(value)
  }
  return this
}

/**
 * Return the previous name in the Space, given a name.
 * @param {string}
 * @return {string}
 */
Space.prototype.prev = function (name) {
  var index = this.keys.indexOf(name) - 1
  if (index >= 0)
    return this.keys[index]
  return this.keys[this.keys.length - 1]
}

Space.prototype.rename = function (oldName, newName) {
  this.values[newName] = this.values[oldName]
  delete this.values[oldName]
  this.keys[this.keys.indexOf(oldName)] = newName
  return this
}

/**
 * Search the space for a given path (xpath).
 * @param {string}
 * @param {space}
 * @param {int} Optional index to insert at
 * @return The matching value
 */
Space.prototype.set = function (key, value, index) {
  if (!key)
    return null
  var steps = key.toString().split(/ /g)
  var context = this
  var step
  while (step = steps.shift()) {
    var newValue
    if (context.values[step] === undefined) {
      if (typeof index === 'number')
        context.keys.splice(index, 0, step)
      else
        context.keys.push(step)
    }
    // Leaf
    if (!steps.length)
      context.values[step] = value
    else if (!(context.values[step] instanceof Space))
      context.values[step] = new Space()
    context = context.values[step]
  }
  return this
}

/**
 * Return executable javascript code.
 * @return {string}
 */
Space.prototype.toJavascript = function () {
  return 'new Space(\'' + this.toString().replace(/\n/g, '\\n').replace(/\'/g, '\\\'') + '\')'
}

/**
 * Return JSON
 * @return {string}
 */
Space.prototype.toJSON = function () {
  return JSON.stringify(this.toObject())
}

/**
 * Returns a regular javascript object
 * @return {object}
 */
Space.prototype.toObject = function () {
  var obj = {}
  for (var i in this.keys) {
    var key = this.keys[i]
    var value = this.values[key]
    if (value instanceof Space)
      obj[key] = value.toObject()
    else
      obj[key] = value
  }
  return obj
}

/**
 * @return {string}
 */
Space.prototype.toString =  function (spaces) {
  spaces = spaces || 0
  var string = ''
  // Iterate over each property
  for (var i in this.keys) {
    
    var key = this.keys[i]
    var value = this.values[key]

    // If property value is undefined
    if (typeof value === 'undefined') {
      string += '\n'
      continue
    }

    // Set up the key part of the key/value pair
    string += Space.strRepeat(' ', spaces) + key
    
    // If the value is a space, concatenate it
    if (value instanceof Space)
      string += '\n' + value.toString(spaces + 1)
    
    // If an object (other than class of space) snuck in there
    else if (typeof value === 'object')
      string += '\n' + new Space(value).toString(spaces + 1)
    
    // dont put a blank string on blank values.
    else if (value.toString() === '')
      string += '\n'
    
    // multiline string
    else if (value.toString().match(/\n/))
      string += ' \n' + Space.strRepeat(' ', spaces + 1) + value.toString().replace(/\n/g, '\n' + Space.strRepeat(' ', spaces + 1)) + '\n'
    
    // Plain string
    else
      string += ' ' + value.toString() + '\n'
  }
  return string
}

// Export Space for use in Node.js
if (typeof exports != 'undefined')
  module.exports = Space;


