declare type content = string | SpaceInstance | Object | any;
declare type int = number;
declare type iterator = (property: string, value: string | SpaceInstance, index: int) => boolean;
declare type SpaceIndex = { [property: string]: number };

interface SpaceType {
  properties: string[],
  index: SpaceIndex
}

interface SpaceStatic {

  /**
   * Construct a new Space instance.
   *
   * @param content content
   * @return space
   */
  (content?: content): SpaceInstance;

  /**
   * The version number of this lib.
   */
  version: string;

  /**
   * Takes all content from the start delimiter to the end delimiter,
   * turns it into a multiline string value, and removes all pairs including the
   * end delimiter.
   *
   * It will parse all heredocs encountered. If a start delimiter is found
   * without a matching end delimiter, all the content after the start
   * delimiter will be used as the heredoc.
   *
   * Returns a new Space object.
   *
   * @param content string
   * @param start Delimiter at start of heredoc
   * @param end Delimiter at end of heredoc
   * @return space
   */
  fromHeredoc: (content: string, start: string, end: string) => SpaceInstance;

  /**
   * Initialize a space object from a Javascript array with a header like:
   *
   * [["name", "number"],
   *  ["breck", "17"]]
   *
   * @param rows (string|int[])[]
   * @return space
   */
  fromArrayWithHeader: (rows: string[][]) => SpaceInstance;

  /**
   * @param str string The csv string to parse
   * @param delimiter string
   * @param hasHeaders? boolean Default is true.
   * @param sanitizeString? boolean Whether to strip carriage returns
   * @param quoteChar? string Defaults to ".
   * @return space
   */
  fromDelimiter: (str: string, delimiter: string, hasHeaders?: boolean, sanitizeString?: boolean, quoteChar?: string) => SpaceInstance;

  /**
   * @param str string The csv string to parse
   * @param hasHeaders boolean Default is true.
   * @return space
   */
  fromCsv: (str: string, hasHeaders?: boolean) => SpaceInstance;

  /**
   * Parses a simple space separated value "name age height\njoe 20 68"
   *
   * @param str string ssv string to parse
   * @param hasHeaders boolean Default is true.
   * @return space
   */
  fromSsv: (str: string, hasHeaders?: boolean) => SpaceInstance;

  /**
   * @param str string The tab string to parse
   * @param hasHeaders boolean Default is true.
   * @return space
   */
  fromTsv: (str: string, hasHeaders?: boolean) => SpaceInstance;

  /**
   * @param str string The XML string to parse
   * @return space
   */
  fromXml: (str: string) => SpaceInstance;

  /**
   * Makes the index for the type.
   * deprecated: will be removed from public api.
   */
  makeIndex: (properties: string[], index: Object, startAt: int) => Object;

  /**
   * Return a new Space with the property/value pairs that all passed spaces contain.
   * todo: deprecate this?
   *
   * @param array Array of Spaces
   * @return space
   */
  union: (a: SpaceInstance, ...n: SpaceInstance[]) => SpaceInstance;
}

interface SpaceInstance {
  /**
   * Add a property & value to the bottom of the space object.
   *
   * @param property string
   * @param value any
   * @return space this
   */
  append: (property: string, value: content) => SpaceInstance;

  /**
   * Return the value at a position.
   *
   * @param index int
   * @return string|space|undefined
   */
  at: (index: int) => string | SpaceInstance;

  /**
   * Deletes all data.
   *
   * @param newContent? any. Optionally pass new content to repopulate the object.
   * @return space this
   */
  clear: (newContent?: content) => SpaceInstance;

  /**
   * Returns a deep copied space.
   *
   * @return space
   */
  clone: () => SpaceInstance;

  /**
   * Append one space object to another.
   *
   * @param b space|string The object to append
   * @return space this
   */
  concat: (b) => SpaceInstance;

  /**
   * Removes duplicate properties. Keeps the last occurence.
   *
   * @param recursive boolean. Default is false.
   * @return space this
   */
  deleteDuplicates: (recursive?: boolean) => SpaceInstance;

  /**
   * Decreases the count of path by 1 or by a custom amount.
   *
   * @param path string
   * @param amount? number Defaults to -1
   * @return this
   */
  decrement: (path: string, amount?: number) => SpaceInstance;

  /**
   * Return the number of pairs in the object including all nested pairs.
   *
   * @return number
   */
  deepLength: () => SpaceInstance;

  /**
   * Deletes a pair(s) from the instance.
   *
   * Deletes all matching pairs.
   *
   * @param property string|spacePath
   * @return space this
   */
  delete: (property: string) => SpaceInstance;

  /**
   * Deletes a pair(s) from the instance at the passed index.
   *
   * If passed an array, deletes all items in that array.
   *
   * @param index int|int[]
   * @return space this
   */
  deleteAt: (index: int|int[]) => SpaceInstance;

  /**
   * Returns the difference between 2 spaces. The difference between 2 spaces is a space.
   *
   * b == a.patch(a.diff(b))
   *
   * todo: clean and refactor this to return line based diffs.
   *
   * @param space The space to compare the instance against.
   * @return space
   */
  diff: (content: content) => SpaceInstance;

  /**
   * Passes property, value, index to each pair.
   *
   * @param fn Have your iterator return false to stop iterating.
   * @param deep boolean Whether to apply fn recursively. Default is false
   * @param reverse boolean Set to true to iterate from bottom to top.
   * @return space this
   */
  each: (fn: iterator, deep: boolean, reverse: boolean) => SpaceInstance;

  /**
   * Apply a function to every line in the instance.
   *
   * If fn returns false the method will immediately return.
   *
   * @param fn iterator
   * @return space this
   */
  every: (fn: iterator) => SpaceInstance;

  /**
   * Scan the entire object and return a new space instance composed of
   * every pair where the key matches one of the passed properties.
   *
   * @param properties Space delimited string of properties. i.e. "date name pageviews"
   * @return space
   */
  extract: (properties: string) => SpaceInstance;

  /**
   * Apply a function to every leaf in the instance.
   *
   * If fn returns false the method will immediately return.
   *
   * @param fn iterator
   * @return space this
   */
  everyLeaf: (fn: iterator) => SpaceInstance;

  /**
   * Returns a space object with only the pairs that return true when
   * passed to the supplied filter function. Returns new object unless inPlace param is true.
   *
   * @param fn function
   * @param inPlace? boolean Default is false. Pass true to edit this instance.
   * @return space
   */
  filter: (fn: iterator, inPlace?: boolean) => SpaceInstance;

  /**
   * Does a recursive search and returns a numbered space instance containing
   * instances where instance.get(property) === value
   *
   * @param property string
   * @param value string
   * @return space A new ordered space instance containing matching instances by reference.
   */
  find: (property: string, value: string) => SpaceInstance;

  /**
   * Set all child instances to the union type.
   *
   * @return space this
   */
  flattenTypes: () => SpaceInstance;

  /**
   * Fills out the passed string with values from the current instance.
   *
   * @param str string. String like "Hello {name}! You are {age} years old."
   * @return string
   */
  format: (str: string) => string;

  /**
   * Returns the value stored at the passed path. If there are multiple matches
   * returns the last match. If there are no matches returns undefined.
   *
   * todo: don't handle non string inputs or handle them differently.
   *
   * @param spacePath string
   * @return string|space|undefined
   */
  get: (spacePath: string) => string | SpaceInstance;

  /**
   * Get all pairs with a matching property as a space object.
   *
   * @param query? string
   * @return space
   */
  getAll: (property: string) => SpaceInstance;

  /**
   * Get all pairs with a matching property as an array.
   *
   * @param query string|int|space
   * @param recursive? Whether to do a recursive search. Default is true
   * @return array
   */
  getArray: (query, recursive) => (string | SpaceInstance)[];

  /**
   * Iterates over the space objects in the instance and for each gets the passed
   * path and returns an array with the results.
   *
   * @param path string
   * @return any[]
   */
  getColumn: (path: string) => (string | SpaceInstance)[];

  /**
   * @return int Returns index of this object in its parent or -1 if it's a root object.
   */
  getIndex: () => int;

  /**
   * @return space Or null if there is no parent
   */
  getParent: () => SpaceInstance;

  /**
   * @return string Space path to this instance if it has a parent
   */
  getPath: () => string;

  /**
   * @return space. Returns the root parent or this instance if it is the root.
   */
  getRoot: () => SpaceInstance;

  /**
   * @param query space
   * @return any
   */
  getBySpace: (query: SpaceInstance) => SpaceInstance;

  /**
   * Returns a shallow array of all the properties.
   *
   * @return string[]
   */
  getProperties: () => string[];

  /**
   * Gets the type for an instance. If not set, will initialize it.
   *
   * @return SpaceType
   */
  getType: () => SpaceType;

  /**
   * Returns a StringMap of all types in this instance.
   *
   * Example return value: {"name age": Type, "color height weight" : Type}
   *
   * This method also sets a type on every instance and removes individual property
   * arrays and caches as it goes, freeing up memory.
   *
   * @return The map
   */
  getTypeIndex: () => { [properties: string]: SpaceType };

  /**
   * Return a Type that is a union of all child types.
   *
   * Note: treats all sub types as a set, so order is not necessarily respected and
   * properties occur only once.
   *
   * @return The union type.
   */
  getUnionType: () => SpaceType;

  /**
   * Returns a shallow array of all the values.
   *
   * @return any[]
   */
  getValues: () => (string | SpaceInstance)[];

  /**
   * Grab multiple properties from the instance and return a new space instance containing
   * just the desired properties.
   *
   * @param string[] Array of properties to grab. i.e. ["date", "name", "pageviews"]
   * @return space
   */
  grab: (properties: string[]) => SpaceInstance;

  /**
   * A method for reducing a collection into groups.
   *
   * Returns a new collection of one instance for each unique value of "path".
   *
   * The passed callback will get called for each child instance. The first parameter
   * to callback is the result group.
   *
   * @param path string|string[]
   * @param fn? (group?: space, member?: space, memberKey?: string, memberIndex?: int):void
   * @return space
   */
  group: (path: string, fn?: (group: SpaceInstance, member: SpaceInstance, memberKey: string, memberIndex: int) => void) => SpaceInstance;

  /**
   * Returns a boolean indicating whether the instance has a property named "property".
   *
   * Returns true if the instance has a property even if the value is empty.
   *
   * @param string
   * @return bool
   */
  has: (property: string) => boolean;

  /**
   * Increases the count of path by 1 or by a custom amount.
   *
   * @param path string
   * @param amount? number Defaults to 1
   * @return this
   */
  increment: (path: string, amount: number) => SpaceInstance;

  /**
   * Return first occurrence of property in object
   *
   * @param property string
   * @param last boolean Set to true to return the last occurrence of property.
   * @return int
   */
  indexOf: (property: string, last?: boolean) => int;

  /**
   * Insert a property value pair at a specific index.
   *
   * @param string
   * @param value any
   * @param index? int
   * @return space this
   */
  insert: (property: string, value: content, index?: int) => SpaceInstance;

  /**
   * Does the length of the object === 0.
   *
   * @return bool
   */
  isEmpty: () => boolean;

  /**
   * Whether this instance has any nested space objects.
   *
   * @return bool
   */
  isFlat: () => boolean;

  /**
   * Check whether the object has only unique properties (is a set).
   *
   * @param deep bool Whether to search recursively. Default is false.
   * @return bool
   */
  isStringMap: (deep?: boolean) => boolean;

  /**
   * Returns the number of children (shallow) the instance has.
   */
  length: number;

  /**
   * Apply a function(s) to every property and value in this instance and rename the
   * property to the return value of the propertiesFn and set the value to the
   * return value of the valuesFn.
   *
   * @param fn (prop: string) => string
   * @param fn (value: any, newPropertyName: string, oldPropertyName: string) => string
   * @param deep boolean Whether to recurse. Default is false.
   * @param inPlace boolean Whether to return a new object or change the current. Default is false
   * @return this
   */
  map: (propertiesFn: (prop: string) => string, valuesFn: (value: string | SpaceInstance, newPropertyName: string, oldPropertyName: string) => string | SpaceInstance, deep?: boolean, inPlace?: boolean) => SpaceInstance;

  /**
   * Merges child space instances with the same property.
   *
   * Does not touch child pairs if the value is not a space instance.
   *
   * @return space this
   */
  mergeDuplicates: () => SpaceInstance;

  /**
   * Return a new space instance which has one property/value. The
   * property is the one passed. The value is the current instance.
   *
   * @param property string
   * @return space this
   */
  nest: (property: string) => SpaceInstance;

  /**
   * Return the next property in the Space, given a property.
   *
   * @param property string
   * @return string
   */
  next: (property: string) => string;

  /**
   * Return the property/value pair at passed index as a space object.
   *
   * @param index int
   * @return space
   */
  pairAt: (index: int) => SpaceInstance;

  /**
   * Apply a patch to the Space instance.
   *
   * @param patch space|string
   * @return space
   */
  patch: (patch: content) => SpaceInstance;

  /**
   * Remove the last item from the object and return the pair as a new space object.
   *
   * @return space
   */
  pop: () => SpaceInstance;

  /**
   * Add a new pair to the beginning of an object.
   *
   * @param property string
   * @param value any
   * @return space
   */
  prepend: (property: string, value: content) => SpaceInstance;

  /**
   * Return the previous property in the Space, given a property.
   *
   * @param name string
   * @return string
   */
  prev: (name: string) => string;

  /**
   * Returns property at passed position
   *
   * @param index int
   * @return string|undefined
   */
  propertyAt: (index: int) => string;

  /**
   * Push a value to the space object and set its property to this.length + 1
   *
   * @param value any
   * @return this
   */
  push: (value: content) => SpaceInstance;

  /**
   * Clear the content of the object and load the passed content.
   *
   * @param space|string
   * @return space this
   */
  reload: (content: content) => SpaceInstance;

  /**
   * Rename the first (or all) occurrence(s) of a property.
   *
   * @param oldName string
   * @param newName string
   * @param renameAll boolean Set to true to rename all occurrences of property.
   * @param recursive boolean Set to true to rename all occurrences of property recursively.
   * @return space this
   */
  rename: (oldName: string, newName: string, renameAll?: boolean, recursive?: boolean) => SpaceInstance;

  /**
   * Iterate through instance and if the value is a Space instance
   * rename its property to a value within that instance.
   *
   * For example:
   *
   * 0
   *  name John Doe
   *  email johndoe@email.com
   *
   * space.renameObjects("email")
   *
   * transforms this into:
   *
   * johndoe@email.com
   *  name John Doe
   *
   * @param string property
   * @return this
   */
  renameObjects: (property: string) => SpaceInstance;

  /**
   * Treat the instance as a string and reload it after the replace operation.
   *
   * @param search string|regex Search string
   * @param replacement string Replacement string
   * @return this
   */
  replace: (search: string | RegExp, replacement: string) => SpaceInstance;

  /**
   * Does a shallow reverse of the instance.
   *
   * @return space this
   */
  reverse: () => SpaceInstance;

  /**
   * Set a property/value pair.
   *
   * @param property string Can be a spacePath
   * @param value any
   * @param index? int
   * @return space this
   */
  set: (property: string, value: content, index?: int) => SpaceInstance;

  /**
   * Changes the type of the instance
   *
   * @param type type
   * @return this
   */
  setType: (type: SpaceType) => SpaceInstance;

  /**
   * A faster and more memory efficient way to set values on an instance.
   *
   * Note that type is getting set by reference so if type changes this
   * instance will be affected. Usually negatively :). Use with caution.
   *
   * @param type {properties: string[], index?: StringMap<int>}
   * @param values any[]
   * @return space this
   */
  setWithType: (type: SpaceType, values: content[]) => SpaceInstance;

  /**
   * Remove the top element from the object
   *
   * @return space The deleted pair
   */
  shift: () => SpaceInstance;

  /**
   * Sorts the instance using the passed comparison function.
   *
   * Pair Interface:
   * { property: string, value: any}
   *
   * @param fn (pairA: Pair, pairB: Pair) => <-1|0|1>
   * @return space this
   */
  sort: (sortFn: (pairA: Object, pairB: Object) => int) => SpaceInstance;

  /**
   * Useful for sorting a collection of space objects.
   *
   * For example:
   *
   * john
   *  age 20
   * mary
   *  age 24
   *
   * space.sortBy("age")
   *
   * Performs a stable sort.
   *
   * @param propertyOrProps string|string[] Space path to sort on.
   * @param parseFnOrFns? (value: any)=>any|(value: any)=>any[] Function to run each value through before comparison.
   * @return space this
   */
  sortBy: (propertyOrProps: string | string[], parseFnOrFns: (value: string | SpaceInstance) => any|any[]) => SpaceInstance;

  /**
   * Splits an object into an array of objects. Everytime the passed
   * property is encountered, a new object is created with that pair as the
   * first pair in the new object. The search begins on the first occurrence
   * of the passed delimiter. Any preceding items will be ignored.
   *
   * @param delimiter string
   * @param propertyName? If provided will return space object with each entry nested under this name.
   * @return array|space Of space objects or space object with nested entries
   */
  split: (delimiter: string, propertyName?: string) => SpaceInstance | SpaceInstance[];

  /**
   * For a space object like this:
   * name John
   * age 12
   * hometown Brockton
   *
   * The TOC is equal to "name age hometown"
   * todo: make nested TOC?
   * todo: remove?
   *
   * @return string
   */
  tableOfContents: () => string;

  /**
   * @return CSV String
   */
  toCsv: () => string;

  /**
   * Returns an SSV string where the cells in each column are the same width.
   *
   * @param maxWidth? Maximum cell width. Default is 100.
   * @return string
   */
  toFixedWidth: (maxWidth?: int) => string;

  /**
   * @param delimiter string
   * @param header? Array like ["name", "city", "state", "country", "income"]
   * @return string
   */
  toDelimited: (delimiter: string, header: string[]) => string;

  /**
   * Return this instance as a JS array in the shape of a CSV file.
   *
   * @param type? Type to get the header for. If not passed the first type will be used.
   * @return (string|int[])[]
   */
  toArrayWithHeader: (type?: SpaceType) => string[][];

  /**
   * Toggle a property between two values.
   *
   * @param property string|int|spacePath
   * @param value1 any
   * @param value2? any If not provided, toggle will either set property to value1 or delete property.
   * @return space this
   */
  toggle: (property: string, value1: any, value2: any) => SpaceInstance;

  /**
   * Return executable javascript code for reserializing this instance.
   *
   * @param backticks? bool Whether to use ES6 backticks. Default is false.
   * @return string
   */
  toJavascript: (backticks?: boolean) => string;

  /**
   * Return JSON
   *
   * Note: when guessTypes is true, toJSON will never return empty arrays, only
   * empty objects, if one is encountered. Handle appropriately.
   *
   * @param guessTypes? Whether to scan for arrays and numbers and convert to predicted type.
   * @param pretty? Whether to pretty print the returned JSON.
   * @return string JSON
   */
  toJSON: (guessTypes?: boolean, pretty?: boolean) => string;

  /**
   * Returns a regular javascript object
   *
   * Note: when guessTypes is true, toJSON will never return empty arrays, only
   * empty objects, if one is encountered. Handle appropriately.
   *
   * Note: native JS objects cannot have dupe keys while space instances can. It
   * may be prudent to use the isStringMap method to ensure you toObject returns what
   * you'd expect.
   *
   * @param guessTypes? Whether to scan for arrays and numbers and convert to predicted type.
   * @return object
   */
  toObject: (guessTypes?: boolean) => Object;

  /**
   * Returns something like name=John&age=23
   *
   * @return string
   */
  toQueryString: () => string;

  /**
   * @return Return space separated string.
   */
  toSsv: () => string;

  /**
   * @return string
   */
  toString: () => string;

  /**
   * @return string
   */
  toTsv: () => string;

  /**
   * Returns instance as URI encoded string for use in URLs.
   *
   * @return string
   */
  toURL: () => string;

  /**
   * @param pretty? boolean
   * @return string
   */
  toXML: (pretty) => string;

  /**
   * @param pretty? boolean
   * @return string
   */
  toXMLWithAttributes: (pretty) => string;

  /**
   * Remove any property whose value is an empty string or empty
   *
   * @param recursive Whether to trim deep. Default is false.
   * @return this
   */
  trim: (recursive?: boolean) => SpaceInstance;

  /**
   * @param index int
   * @param property any
   * @param value any
   * @return space this
   */
  update: (index: int, property: string, value: content) => SpaceInstance;

  /**
   * Alias of "at"
   *
   * @param index int
   * @return string|space|undefined
   */
  valueAt: (index) => string | SpaceInstance;
}
