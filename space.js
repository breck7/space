function Space(content) {
  this._pairs = []  
  this.events = {}
  this._load(content)
  return this
}

Space.version = '0.5.10'

Space.arrayDelete = function (array, index) {
  return array.slice(0,index).concat(array.slice(index+1))
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
    str += string
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
  this._pairs = []
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
    this._load(space)
  this.trigger('change')
  return this
}

/**
 * Returns a deep copied space.
 * @return {Space}
 */
Space.prototype.clone = function () {
  return new Space(this.toString())
}

Space.prototype.concat = function (b) {
  if (typeof b === 'string')
    b = new Space(b)
  var a = this
  b.each(function (key, value) {
    a.append(key, value)
  })
  return this
}

Space.prototype.create = function (key, value) {
  this._setPair(key, value)
  this.trigger('create', key, value)
  this.trigger('change')
  return this
}

Space.prototype._delete = function (key) {
  if (!key.toString().match(/ /)) {
    var index = this.indexOf(key)
    if (index === -1)
      return 0
    this._deletePair(index)
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

Space.prototype['delete'] = function (key) {
  if (this._delete(key))
    this.trigger('delete', key)
  this.trigger('change')
  return this
}

Space.prototype._deletePair = function (index) {
  this._pairs.splice(index, 1)
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
  for (var i in this._pairs) {
    if (fn.call(this, this._pairs[i][0], this._pairs[i][1], i) === false)
      return this
  }
  return this
}

Space.prototype.filter = function (fn) {
  var result = new Space()
  for (var i in this._pairs) {
    if (fn.call(this, this._pairs[i][0], this._pairs[i][1], i) === true)
      result.append(this._pairs[i][0], this._pairs[i][1])
  }
  return result
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
  this.each(function (key, value, index) {
    fn.call(this, key, value, index)
    if (value instanceof Space)
      value.every(fn)
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
  return this._getValueByString(query.toString())
}

Space.prototype.getAll = function (query) {
  var matches = new Space()
  this.each(function (key, value) {
    if (key !== query)
      return true
    matches.append(key, value)
  })
  return matches
}

Space.prototype.getByIndex = function (index) {
  return this._getValueByIndex(index)
}

Space.prototype.getByIndexPath = function (query) {
  var parts = query.split(/ /g)
  var first = parseFloat(parts.shift())
  if (parts.length === 0)
    return this._getValueByIndex(first)
  else
    return this._getValueByIndex(first).getByIndexPath(parts.join(' '))
}

Space.prototype.getBySpace = function (query) {
  return this._getValueBySpace(query)
}

/**
 * @param {int}
 * @return The matching value
 */
Space.prototype._getValueByIndex = function (index) {
  // Passing -1 gets the last item, et cetera
  if (index < 0)
    index = this.length() + index
  if (this._pairs[index])
    return this._pairs[index][1]
  return undefined
}

Space.prototype._getValueByKey = function (key) {
  var result
  this._pairs.forEach(function (pair, index) {
    if (pair[0] === key) {
      result = pair[1]
      return false
    }
  })
  return result
}

Space.prototype._getKeyByIndex = function (index) {
  // Passing -1 gets the last item, et cetera
  if (index < 0)
    index = this.length() + index
  return this.getKeys()[index]
}

Space.prototype.getKeys = function () {
  var keys = []
  this._pairs.forEach(function (pair, index) {
    keys.push(pair[0])
  })
  return keys
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

Space.prototype.__height = function () {
  return this.toString().match(/\n/g).length
}

Space.prototype.indexOf = function (key) {
  return this.getKeys().indexOf(key)
}

Space.prototype.insert = function (key, value, index) {
  this._setPair(key, value, index)
  return this
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

Space.prototype._load = function (content) {
  
  // Load from string
  if (typeof content === 'string')
    return this._loadFromString(content)
  
  // Load from Space object
  if (content instanceof Space) {
    var me = this
    content.each(function (key, value) {
      me._setPair(key, value)
    })
    return this
  }
  
  // Load from object
  for (var key in content) {
    // In case hasOwnProperty has been overwritten we
    // call the original
    if (!Object.prototype.hasOwnProperty.call(content, key))
      continue
    var value = content[key]
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
Space.prototype._loadFromString = function (string) {
  
  // Space always start on a key. Eliminate whitespace at beginning of string
  string = string.replace(/^[\n ]*/, '')
  
  /** Eliminate Windows \r characters and newlines at end of string.*/
  string = string.replace(/\n\r/g, '\n').replace(/\r\n/g, '\n')
  
  /** Eliminate newlines at end of string.*/
//  string = string.replace(/\n[\n ]*$/, '')
  
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
      this._setPair(matches[1], space.substr(matches[1].length + 1).replace(/\n /g, '\n') )
  }
  return this
}

/**
 * Return the next key in the Space, given a key.
 * @param {string}
 * @return {string}
 */
Space.prototype.next = function (key) {
  var index = this.indexOf(key)
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
  var copy = this.clone()
  me._clear()
  space.each(function (key, value) {
    me._setPair(key, copy.get(key))
    // Recurse
    if (value instanceof Space && value.length() && copy._getValueByKey(key) instanceof Space)
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

Space.prototype.prepend = function (key, value) {
  return this._setPair(key, value, 0)
}

/**
 * Return the previous name in the Space, given a name.
 * @param {string}
 * @return {string}
 */
Space.prototype.prev = function (name) {
  var index = this.indexOf(name)
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
  var index = this.indexOf(oldName)
  this._setPair(newName, this._getValueByKey(oldName), index, true)
  return this
}

Space.prototype.reload = function (content) {
  // todo, don't trigger patch if no change
  this._pairs = []  
  this._load(content)
  this.trigger('reload')
  return this
}

Space.prototype.rename = function (oldName, newName) {
  this._rename(oldName, newName)
  if (oldName !== newName)
    this.trigger('rename', oldName, newName)
  this.trigger('change')
  return this
}

Space.prototype.set = function (key, value, index) {
  key = key.toString()
  if (Space.isXPath(key))
    this._setByXPath(key, value)
  else if (this.has(key))
    this._setPair(key, value, this.indexOf(key), true)
  else
    this._setPair(key, value, index)
  this.trigger('set', key, value, index)
  this.trigger('change')
  return this
}

Space.prototype.setByIndexPath = function (query, value) {
  if (!Space.isXPath(query)) {
    var i = parseFloat(query)
    this.update(i, this._getKeyByIndex(i), value)
    return this
  }
  var branch = Space.pathBranch(query)
  var space = this.getByIndexPath(branch)
  if (!space)
    return this
  var key = parseFloat(Space.pathLeaf(query))
  space.update(key, space._getKeyByIndex(key), value)
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
  var index
  for (var i = 0; i < generations.length; i++) {
    currentKey = generations[i]
    // If path is already set, continue
    if (context._getValueByKey(currentKey) instanceof Space) {
      context = context.get(currentKey)
      continue
    }
      
    var newValue
    // Leaf
    if (i === (generations.length - 1))
      newValue = value
    else
      newValue = new Space()
    
    // update pair
    if (context.has(currentKey)) {
      var index = context.indexOf(currentKey)
      context._setPair(currentKey, newValue, index, true)
    } else
      context._setPair(currentKey, newValue)
    context = context.get(currentKey)
  }
  return this
}

Space.prototype._setPair = function (key, value, index, overwrite) {
  key = key.toString()
  if (index === undefined)
    this._pairs.push([key, value])
  else if (overwrite)
    this._pairs.splice(index, 1, [key, value])
  else
    this._pairs.splice(index, 0, [key, value])
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

Space.prototype.sort = function (fn) {
  this._pairs = this._pairs.sort(fn)
  return this
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

Space.prototype.toBinary = function () {
  var binary = ''
  var str = this.toString()
  for (var i = 0; i < str.length; i ++) {
    var bits = parseFloat(str.substr(i, 1).charCodeAt(0)).toString(2)
    while (bits.length < 8) {
      bits = '0' + bits
    }
    binary += bits
  }
  return binary.replace(/0/g, '-').replace(/1/g, '|')
}

Space.prototype.toBinaryMatrixString = function () {
  var str = ''
  var matrix = this.toDecimalMatrix()
  matrix.forEach(function (row, i) {
    row.forEach(function (c, j) {
      var bits = c.toString(2)
      while (bits.length < 8) {
        bits = '0' + bits
      }
      str += bits
    })
    str += '\n'
  })
  return str
}

Space.prototype.toDecimalMatrix = function () {
  var width = this.__width()
  var lines = this.toString().replace(/\n$/,'').split(/\n/g)
  var matrix = []
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    var row = []
    var length = line.length
    for (var c = 0; c < width; c++) {
      if (c < length)
        row.push(line.substr(c, 1).charCodeAt(0))
      else
        row.push(0)
    }
    matrix.push(row)
  }
  return matrix
}

Space.prototype.toDecimalMatrixString = function () {
  var str = ''
  var matrix = this.toDecimalMatrix()
  matrix.forEach(function (row, i) {
    var first = ''
    row.forEach(function (c, j) {
      str = str + first
      if (c < 10)
        str += '00' + c
      else if (c > 9 && c < 100)
        str += '0' + c
      else
        str += c
      first = ' '
    })
    str += '\n'
  })
  return str
}

/**
 * Return executable javascript code.
 * @return {string}
 */
Space.prototype.toJavascript = function (multiline) {
  var str = 'new Space(\'' + this.toString().replace(/\n/g, '\\n').replace(/\'/g, '\\\'') + '\')'
  if (multiline)
    return str.replace(/\\n/g, "\\n\\\n")
  return str
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

Space.prototype.toQueryString = function () {
  var string = ''
  var first = ''
  this.each(function (key, value) {
    string += first + encodeURIComponent(key) + '=' + encodeURIComponent(value)
    first = '&'
  })
  return string
}

Space.prototype.toShapes = function (spaces) {
  spaces = spaces || 0
  var string = 'V\n'
  // Iterate over each property
  this.each(function (key, value) {
    
    // If property value is undefined
    if (typeof value === 'undefined') {
      string += '\n'
      return true
    }

    // Set up the key part of the key/value pair
    string += Space.strRepeat(' ', spaces) + 'O'
    
    // If the value is a space, concatenate it
    if (value instanceof Space)
      string += value.toShapes(spaces + 1)
    
    // If an object (other than class of space) snuck in there
    else if (typeof value === 'object')
      string += new Space(value).toShapes(spaces + 1)
    
    // dont put a blank string on a blank value.
    else if (value.toString() === '')
      string += ' \n'

    // Plain string
    else
      string += '[]' + '\n'
    
  })

  return string
}

/**
 * @return {string}
 */
Space.prototype.toString = function (spaces) {
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
      string += ' ' + value.toString().replace(/\n/g, '\n' + Space.strRepeat(' ', spaces + 1)) + '\n'
    
    // Plain string
    else
      string += ' ' + value.toString() + '\n'
    
  })

  return string
}

Space.prototype.toURL = function () {
  return encodeURIComponent(this.toString())
}

Space.prototype.__transpose = function (templateString) {
  var result = ''
  this.each(function (key, value) {
    var template = new Space(templateString.toString())
    template.every(function (k, xpath, index) {
      if (value._getValueByKey(xpath))
        this._setPair(k, value._getValueByKey(xpath), index, true)
    })
    result += template.toString()
  })
  return new Space(result)
}

Space.prototype.trigger = function (eventName) {
  if (!this.events[eventName])
    return true
  var args = Array.prototype.slice.call(arguments)
  for (var i in this.events[eventName]) {
    this.events[eventName][i].apply(this, args.slice(1))
  }
}

Space.prototype.update = function (index, key, value) {
  this._setPair(key, value, index, true)
  return this
}

Space.prototype.__width = function () {
  var lines = this.toString().split(/\n/g)
  var width = 0
  lines.forEach(function (str, key) {
    if (str.length > width)
      width = str.length
  })
  return width
}

// Export Space for use in Node.js
if (typeof exports != 'undefined')
  module.exports = Space;


