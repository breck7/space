function Space(properties) {
  
  this._clearKeys()
  this._clearValues()
  this.events = {}
  this._parse(properties)
  return this
}

Space.isXPath = function (key) {
  return key.match(/ /)
}

Space.pathBranch = function (xpath) {
  var nodes = xpath.split(/ /g)
  if (nodes.length < 2)
    return ''
  nodes.pop()
  return nodes.join(' ')
}

Space.pathLeaf = function (xpath) {
  var nodes = xpath.split(/ /g)
  if (nodes.length < 2)
    return xpath
  return nodes[nodes.length - 1]
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
    if (!union.length()) break
  }
  return union
}

/**
 * todo: this method will probably be removed.
 * @param {Space}
 * @return {Space}
 */
Space.unionSingle = function(spaceA, spaceB) {
  var union = new Space()
  if (!(spaceB instanceof Space))
    return union
  spaceA.each(function (key, value) {
    if (value instanceof Space && spaceB._getValueByKey(key) && spaceB._getValueByKey(key) instanceof Space)
      union._setPair(key, Space.unionSingle(value, spaceB._getValueByKey(key)))
    if (value === spaceB._getValueByKey(key))
      union._setPair(key, value)
  })
  return union
}

Space.prototype.append = function (key, value) {
  this._setPair(key, value)
  this.trigger('append', key, value)
  this.trigger('change')
  return this
}

/**
 * Deletes all data. Should this clear listeners?
 * @return this
 */
Space.prototype._clear = function () {
  this._clearKeys()
  this._clearValues()
  return this
}

/**
 * Deletes all data. Should this clear listeners?
 * @return this
 */
Space.prototype.clear = function (space) {
  if (this.isEmpty())
    return this
  this._clear()
  this.trigger('clear')
  if (space)
    this._parse(space)
  this.trigger('change')
  return this
}

Space.prototype._clearKeys = function () {
  this._keys = []
}

Space.prototype._clearValues = function () {
  this._values = {}
}

/**
 * Returns a deep copied space.
 * @return {Space}
 */
Space.prototype.clone = function () {
  return new Space(this.toString())
}

Space.prototype.create = function (key, value) {
  this._setPair(key, value)
  this.trigger('create', key, value)
  this.trigger('change')
  return this
}

Space.prototype._delete = function (key) {
  if (!key.toString().match(/ /)) {
    var index = this._getIndexByKey(key)
    if (index === -1)
      return 0
    this._deleteKeyByIndex(index)
    this._deleteValueByKey(key)
    return 1
  }
  // Get parent
  var parts = key.split(/ /)
  var child = parts.pop()
  var parent = this.get(parts.join(' '))
  if (parent instanceof Space)
    return parent._delete(child)
  return 0
}

Space.prototype.delete = function (key) {
  if (this._delete(key))
    this.trigger('delete', key)
  this.trigger('change')
  return this
}

Space.prototype._deleteKeyByIndex = function (index) {
  this._keys.splice(index, 1)
}

Space.prototype._deleteValueByKey = function (key) {
  delete this._values[key]
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

  this.each(function (key, value) {
    
    var spaceValue = space._getValueByKey(key)

    // Case: Deleted
    if (typeof spaceValue === 'undefined') {
      diff._setPair(key, '')
      return true
    }
    // Different Types
    if (typeof(this._getValueByKey(key)) !== typeof(spaceValue)) {
      if (typeof spaceValue === 'object')
        diff._setPair(key, new Space(spaceValue))
      
      // We treat a spaceValue of 1 equal to '1'
      else if (this._getValueByKey(key) == spaceValue)
        return true
      else
        diff._setPair(key, spaceValue)
      return true
    }
    // Strings, floats, etc
    if (typeof(this._getValueByKey(key)) !== 'object') {
      if (this._getValueByKey(key) != spaceValue)
        diff._setPair(key, spaceValue)
      return true
    }
    // Both are Objects
    var sub_diff = this._getValueByKey(key).diff(spaceValue)
    if (sub_diff.length())
      diff._setPair(key, sub_diff)
  })

  // Leftovers are Additions
  var me = this
  space.each(function (key, value) {
    if (me.has(key))
      return true
    if (typeof value !== 'object') {
      diff._setPair(key, value)
      return true
    }
    else if (value instanceof Space)
      diff._setPair(key, new Space(value))
    else
      diff._setPair(key, new Space(space))
  })
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
  var me = this
  space.each(function (key, value) {
    if (!(value instanceof Space) || !(me._getValueByKey(key) instanceof Space))
      return true
    var childDiff = me._getValueByKey(key).diffOrder(value)
    if (childDiff.isEmpty())
      return true
    diff._setPair(key, childDiff)
  })
  
  // Parent hasnt changed
  if (space.tableOfContents() === this.tableOfContents())
    return diff
  // Parent has changed
  space.each(function (key, value) {
    if (!diff.has(key))
      diff._setPair(key, new Space())
  })
  return diff
}

Space.prototype.each = function (fn) {
  var keys = this.getKeys()
  for (var i in keys) {
    var key = keys[i]
    if (fn.call(this, key, this._getValueByKey(key)) === false)
      return this
  }
  return this
}

Space.prototype.find = function (keyTest, valueTest) {
  // for now assume string test
  // search this one
  var matches = new Space()
  if (this.get(keyTest) === valueTest)
    matches.push(this)
  this.each(function (key, value) {
    if (!(value instanceof Space))
      return true
    value
      .find(keyTest, valueTest)
      .each(function (k, v) {
        matches.push(v)    
      })
  })
  return matches
}

Space.prototype.every = function (fn) {
  this.each(function (key, value) {
    if (value instanceof Space)
      value.every(fn)
    fn.call(this, key, value)    
  })
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
      return this._getValueByString(query)
    break
    case "object":
      return this._getValueBySpace(query)
    break
    case "number":
      return this._getValueByIndex(query)
    break
  }
  return null
}

/**
 * @param {int}
 * @return The matching value
 */
Space.prototype._getValueByIndex = function (index) {
  var key = this._getKeyByIndex(index)
  return this._getValueByKey(key)
}

Space.prototype._getValueByKey = function (key) {
  return this._values[key]
}

Space.prototype._getIndexByKey = function (key) {
  return this.getKeys().indexOf(key)
}

Space.prototype._getKeyByIndex = function (index) {
  // Passing -1 gets the last item, et cetera
  if (index < 0)
    index = this.length() + index
  return this.getKeys()[index]
}

Space.prototype.getKeys = function () {
  return this._keys
}


/**
 * Search the space for a given path (xpath).
 * @param {string}
 * @return The matching value
 */
Space.prototype._getValueByString = function (xpath) {
  
  if (!xpath)
    return undefined
  if (!xpath.match(/ /))
    return this._getValueByKey(xpath)
  var parts = xpath.split(/ /g)
  var current = parts.shift()
  
  // Not set
  if (!this.has(current))
    return undefined
  
  if (this._getValueByKey(current) instanceof Space)
    return this._getValueByKey(current).get(parts.join(' '))
  
  else
    return undefined
}

/**
 * Recursively retrieve properties.
 * @param {space} 
 * @return Space
 */
Space.prototype._getValueBySpace = function (space) {
  var result = new Space()
  
  var me = this
  space.each(function (key, v) {
    var value = me._getValueByKey(key)
    
    // If this doesnt have that property, continue
    if (typeof value === 'undefined')
      return true
    
    // If the request is a leaf or empty space, set
    if (!(space._getValueByKey(key) instanceof Space) || !space._getValueByKey(key).length()) {
      result._setPair(key, value)
      return true
    }
    
    // Else the request is a space with keys, make sure the subject is a space
    if (!(value instanceof Space))
      return true
    
    // Now time to recurse
    result._setPair(key, value._getValueBySpace(space._getValueByKey(key)))
  })
  return result 
}

Space.prototype.getTokens = function (debug) {
  
  var string = this.toString()
  var mode = 'K'
  var tokens = ''
  var escapeLength = 1
  var escaping = 0
  for (var i = 0; i < string.length - 1; i++) {
    var character = string.substr(i, 1)
    if (debug)
      console.log('map: %s; mode: %s; char: %s', tokens, mode, character)

    if (escaping > 0) {
    // skip over the escaped spaces
      tokens += 'E'
      escaping--
      continue
    }
    
    if (character !== ' ' && character !== '\n') {
      if (mode === 'N')
        mode = 'K'
      tokens += mode
      continue
    }
    
    if (character === ' ') {
      
      if (mode === 'V') {
        tokens += mode
        continue
      }
      
      else if (mode === 'K') {
        tokens += 'S'
        mode = 'V'
        continue        
      }
      
      // KEY hunt mode
      else {
        escapeLength++
        tokens += 'N'
        continue
      }
      
    }
    
    //  else its a newline
    
    if (mode === 'K') {
      mode = 'N'
      escapeLength = 1
      tokens += 'N'
      continue
    }
    
    else if (mode === 'V') {
      
      // if is escaped
      if (string.substr(i + 1, escapeLength) === Space.strRepeat(' ', escapeLength)) {
        tokens += 'V'
        escaping = escapeLength
        continue
      }
      
      // else not escaped
      mode = 'N'
      escapeLength = 1
      tokens += 'N'
      continue
      
      
    }
  
  }
  
  return tokens
  
}

Space.prototype.getTokensConcise = function () {
  // http://stackoverflow.com/questions/7780794/javascript-regex-remove-duplicate-characters
  return this.getTokens().replace(/[^\w\s]|(.)(?=\1)/gi, "")
}

Space.prototype.has = function (key) {
  return this._getValueByKey(key) !== undefined
}

Space.prototype._insertKey = function (index, key) {
  this._keys.splice(index, 0, key)
}

Space.prototype.isEmpty = function () {
  return this.length() === 0
}

/**
 * Does a deep check of whether the object has only unique keys
 */
Space.prototype.isASet = function () {
  var result = true
  var set = {}
  this.each(function (key, value) {
    if (set[key]) {
      result = false
      return false
    }
    set[key] = true
    if (value instanceof Space) {
      if (value.isASet())
        return true
      result = false
      return false  
    }
  })
  return result
}

Space.prototype._keyCount = function () {
  var count = this.length()
  this.each(function (key, value) {
    if (value instanceof Space)
      count += value._keyCount()
  })
  return count
}

/**
 * @return int
 */
Space.prototype.length = function () {
  return this.getKeys().length
}

/**
 * Return the next key in the Space, given a key.
 * @param {string}
 * @return {string}
 */
Space.prototype.next = function (key) {
  var index = this._getIndexByKey(key)
  var next = index + 1
  return this._getKeyByIndex(next)
}

Space.prototype.off = function (eventName, fn) {
  if (!this.events[eventName])
    return true
  for (var i in this.events[eventName]) {
    if (this.events[eventName][i] === fn)
      this.events[eventName].splice(i, 1)
  }
}

Space.prototype._objectCount = function () {
  var count = 0
  this.each(function (key, value) {
    if (value instanceof Space)
      count += 1 + value._objectCount()
  })
  return count
}

Space.prototype.on = function (eventName, fn) {
  
  if (!this.events[eventName])
    this.events[eventName] = []
  this.events[eventName].push(fn)
}

Space.prototype._parse = function (properties) {
  
  // Load from string
  if (typeof properties === 'string')
    return this._parseFromString(properties)
  
  // Load from Space object
  if (properties instanceof Space) {
    var me = this
    properties.each(function (key, value) {
      me._setPair(key, value)
    })
    return this
  }
  
  // Load from object
  for (var key in properties) {
    // In case hasOwnProperty has been overwritten we
    // call the original
    if (!Object.prototype.hasOwnProperty.call(properties, key))
      continue
    var value = properties[key]
    if (typeof value === 'object')
      this._setPair(key, new Space(value))
    else
      this._setPair(key, value)
  }
}

/**
 * Construct the Space from a string.
 * @param {string}
 * @return {Space}
 */
Space.prototype._parseFromString = function (string) {
  
  // Space always start on a key. Eliminate whitespace at beginning of string
  string = string.replace(/^[\n ]*/, '')
  
  /** Eliminate Windows \r characters and newlines at end of string.*/
  string = string.replace(/\n\r/g, '\n').replace(/\r\n/g, '\n')
  
  /** Eliminate newlines at end of string.*/
  string = string.replace(/\n[\n ]*$/, '')
  
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
  var matches
  for (var i in spaces) {
    var space = spaces[i]
    if (matches = space.match(/^([^ ]+)(\n|$)/)) // Space
      this._setPair(matches[1], new Space(space.substr(matches[1].length).replace(/\n /g, '\n')))
    else if (matches = space.match(/^([^ ]+) /)) // Leaf
      this._setPair(matches[1], space.substr(matches[1].length + 1).replace(/^\n /, '').replace(/\n /g, '\n') )
  }
  return this
}

/**
 * Apply a patch to the Space instance.
 * @param {Space|string}
 * @return {Space}
 */
Space.prototype._patch = function (patch) {
  
  if (!(patch instanceof Space))
    patch = new Space(patch)
  
  var me = this
  patch.each(function (key, patchValue) {
    
    // If patch value is a string, doesnt matter what type subject is.
    if (typeof patchValue === 'string') {
      if (patchValue === '')
        me._delete(key)
      else
        me._setPair(key, patchValue)
      return true
    }
    
    // If patch value is an int, doesnt matter what type subject is.
    if (typeof patchValue === 'number') {
      me._setPair(key, patchValue)
      return true
    }
    
    // If its an empty space, delete patch.
    if (patchValue instanceof Space && !patchValue.length()) {
      me._delete(key)
      return true
    }
    
    // If both subject value and patch value are Spaces, do a recursive patch.
    if (me._getValueByKey(key) instanceof Space) {
      me._getValueByKey(key)._patch(patchValue)
      return true
    }
    
    // Final case. Do a deep copy of space.
    me._setPair(key, new Space(patchValue))
    
  })

  return this
}

Space.prototype.patch = function (patch) {
  // todo, don't trigger patch if no change
  this._patch(patch)
  this.trigger('patch', patch)
  this.trigger('change')
  return this
}

/**
 * Change the order of the keys
 * @param {array|string}
 * @return {this}
 */
Space.prototype._patchOrder = function (space) {
  
  if (!(space instanceof Space))
    space = new Space(space)

  var me = this
  me._clearKeys()
  var i = 0
  space.each(function (key, value) {
    me._setKey(i, key)
    i++
    if (value instanceof Space && value.length() && me._getValueByKey(key) instanceof Space)
      me._getValueByKey(key)._patchOrder(value)
  })
  return this
}

Space.prototype.patchOrder = function (space) {
  // todo: don't trigger event if no change
  this._patchOrder(space)
  this.trigger('patchOrder', space)
  this.trigger('change')
  return this
}

Space.prototype.pop = function () {
  if (!this.length())
    return null
  var result = new Space()
  var key = this._getKeyByIndex(-1)
  var value = this._getValueByKey(key)
  result.set(key, value)
  this._delete(key)
  return result
}

/**
 * Return the previous name in the Space, given a name.
 * @param {string}
 * @return {string}
 */
Space.prototype.prev = function (name) {
  var index = this._getIndexByKey(name)
  var prev = index - 1
  return this._getKeyByIndex(prev)
}

Space.prototype.push = function (value) {
  var i = this.length()
  while (this.get(i.toString())) {
    i++
  }
  this._setPair(i.toString(), value)
  return this
}

Space.prototype._rename = function (oldName, newName) {
  this._setValue(newName, this._getValueByKey(oldName))
  this._deleteValueByKey(oldName)
  var index = this._getIndexByKey(oldName)
  this._setKey(index, newName)
  return this
}

Space.prototype.rename = function (oldName, newName) {
  var branch = Space.pathBranch(oldName)
  var leaf = Space.pathLeaf(oldName)
  var newLeaf = newName
  var space = this
  if (branch) {
    space = this.get(branch)
    newLeaf = newName.substr(branch.length + 1)
  }
  space._rename(leaf, newLeaf)
  if (oldName !== newName)
    this.trigger('rename', oldName, newName)
  this.trigger('change')
  return this
}

Space.prototype.set = function (key, value, index) {
  if (Space.isXPath(key.toString()))
    this._setByXPath(key, value)
  else
    this._setPair(key, value, index)
  this.trigger('set', key, value, index)
  this.trigger('change')
  return this
}

/**
 * Search the space for a given path (xpath).
 * @param {string}
 * @param {space}
 * @param {int} Optional index to insert at
 * @return The matching value
 */
Space.prototype._setByXPath = function (key, value) {
  if (!key)
    return null
  var generations = key.toString().split(/ /g)
  var context = this
  var currentKey
  for (var i = 0; i < generations.length; i++) {
    currentKey = generations[i]
    if (!context.has(currentKey))
      context._setKey(context.length(), currentKey)
    // Leaf
    if (i === (generations.length - 1))
      context._setValue(currentKey, value)
    else if (!(context._getValueByKey(currentKey) instanceof Space))
      context._setValue(currentKey, new Space())
    context = context.get(currentKey)
  }
  return this
}

Space.prototype._setKey = function (index, key) {
  this._keys[index] = key
}

Space.prototype._setPair = function (key, value, index) {
  this._values[key] = value
  if (index === undefined)
    this._keys.push(key)
  else
    this._insertKey(index, key)
}

Space.prototype._setValue = function (key, value) {
  this._values[key] = value
}

Space.prototype.shift = function () {
  if (!this.length())
    return null
  var key = this._getKeyByIndex(0)
  var result = new Space()
  result.set(key, this.get(key))
  this._delete(key)
  return result
}

/**
 * For a space object like this:
 * name John
 * age 12
 * hometown Brockton
 *
 * The TOC is equal to "name age hometown"
 * todo: make nested TOC?
 *
 */
Space.prototype.tableOfContents = function () {
  return this.getKeys().join(' ')
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
  this.each(function (key, value) {
    if (value instanceof Space)
      obj[key] = value.toObject()
    else
      obj[key] = value
  })
  return obj
}

/**
 * @return {string}
 */
Space.prototype.toString =  function (spaces) {
  spaces = spaces || 0
  var string = ''
  // Iterate over each property
  this.each(function (key, value) {
    
    // If property value is undefined
    if (typeof value === 'undefined') {
      string += '\n'
      return true
    }

    // Set up the key part of the key/value pair
    string += Space.strRepeat(' ', spaces) + key
    
    // If the value is a space, concatenate it
    if (value instanceof Space)
      string += '\n' + value.toString(spaces + 1)
    
    // If an object (other than class of space) snuck in there
    else if (typeof value === 'object')
      string += '\n' + new Space(value).toString(spaces + 1)
    
    // dont put a blank string on a blank value.
    else if (value.toString() === '')
      string += ' \n'
    
    // multiline string
    else if (value.toString().match(/\n/))
      string += ' \n' + Space.strRepeat(' ', spaces + 1) + value.toString().replace(/\n/g, '\n' + Space.strRepeat(' ', spaces + 1)) + '\n'
    
    // Plain string
    else
      string += ' ' + value.toString() + '\n'
    
  })

  return string
}

Space.prototype.toURL = function () {
  return encodeURIComponent(this.toString())
}

Space.prototype.trigger = function (eventName) {
  if (!this.events[eventName])
    return true
  var args = Array.prototype.slice.call(arguments)
  for (var i in this.events[eventName]) {
    this.events[eventName][i].apply(this, args.slice(1))
  }
}

// Export Space for use in Node.js
if (typeof exports != 'undefined')
  module.exports = Space;


