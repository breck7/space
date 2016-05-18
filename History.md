0.22.2 / 2016-05-17
===================
- Removed unused second param to _setTokens

0.22.1 / 2016-05-10
===================
- Added quoteChar parameter to fromDelimiter to allow passing of different enclosing chars.

0.22.0 / 2016-04-19
===================
- Refactor to make token characters all vars instead of strings.
- BREAKING: Minor change to toJavascript(true); now returns code using backticks instead of escaped new lines.

0.21.5 / 2016-04-10
===================
- Added maxWidth param to toFixedWidth method

0.21.4 / 2016-04-10
===================
- Added toFixedWidth method
- Changed some code from ES5 => ES6

0.21.3 / 2016-03-27
===================
- fromDelimiter now will ensure that all rows have an equal number of columns

0.21.2 / 2016-03-24
===================
- Updated toggle method to make 2nd param optional. Not passing it will add/remove property being toggled.
- Internal: Moved testStrings to test file.

0.21.1 / 2016-02-15
===================
- Added space.d.ts and moved doc comments from space.js to space.d.ts

0.21.0 / 2016-02-14
===================
- BREAKING: Removed Events and Listeners. If needed, one could create a proxy class that extends built in methods with events. The code is cleaner without the events (fewer side effects)
- BREAKING: Removed on, off, trigger, clearListeners, and create methods.
- Removed the 4th param to "set" method (noEvents)

0.20.1 / 2016-02-14
===================
- Refactored to use strict and ES6
- Fixed 2 accidental global var bugs

0.19.11 / 2016-02-09
====================
- Fixed bug where multiple newline sanitizing wasn't global

0.19.10 / 2015-11-01
====================
- Fixed bug in fromDelimiter method

0.19.9 / 2015-11-01
===================
- Added getType, getTypeIndex, getUnionType, flattenTypes and setType methods

0.19.8 / 2015-10-31
===================
- Added fromArrayWithHeader and toArrayWithHeader methods

0.19.7 / 2015-10-30
===================
- 2x speedup for fromCsv when string input has no quotes

0.19.6 / 2015-10-30
===================
- Re-added handling of int inputs to get
- Added inPlace? param to filter method

0.19.5 / 2015-10-28
===================
- Added static makeIndex method
- Added public setWithType method

0.19.4 / 2015-10-28
===================
- Internal: cleanup of internal types

0.19.3 / 2015-10-25
===================
- Added _typeCache for better performance when using fromDelimited

0.19.2 / 2015-10-25
===================
- Internal performance improvements
- Added _setType for sharing an array across objects
- _cache is now computed only when/if requested, not on every write
- _properties and _values are set only when/if needed
- fromDelimited now runs in 70% less time and uses 40% less memory on benchmark suite

0.19.1 / 2015-10-21
===================
- sortBy can now take an array of properties to sort on

0.19.0 / 2015-09-27
===================
- BREAKING: Added recursive param to getArray. Made it recursive by default.

0.18.0 / 2015-09-22
===================
- BREAKING: "delete" method no longer accepts ints, use deleteAt method instead.
- Added deleteAt method

0.17.0 / 2015-09-15
===================
- BREAKING: Removed last, lastValue, lastProperty, first, firstValue, firstProperty methods.
- Added propertyAt, pairAt, valueAt methods.

0.16.1 / 2015-09-14
===================
- Fixed bug in fromDelimiter method where \r were not ignored.

0.16.0 / 2015-09-13
===================
- BREAKING: renamed "getByIndex" method to "at"
- BREAKING: changed parameters to group method to allow grouping by multiple params
- Added grab method

0.15.3 / 2015-09-09
===================
- Added increment and decrement methods
- Added group method

0.15.2 / 2015-09-04
===================
- Added format method
- Added getColumn method

0.15.1 / 2015-08-02
===================
- Added getIndex method

0.15.0 / 2015-06-25
===================
- BREAKING: Removed fromFile, toFile, fromUrl, toUrl methods
- Code cleanup

0.14.0 / 2015-05-29
===================
- BREAKING: Removed unionSingle static method
- BREAKING: Removed diffOrder, patchOrder, lastIndexOf, getCud methods
- BREAKING: Renamed wrap method nest
- Added mergeDuplicates and deleteDuplicates methods
- Added "last" parameter to indexOf method instead of having lastIndexOf method
- Added "reverse" parameter to each to iterate in reverse order
- Swapped match() calls with indexOf() calls for better perf
- Code cleanup: switched to verbose var declarations

0.12.13 / 2015-05-24
====================
- Fixed bug in delete method

0.12.12 / 2015-05-17
====================
- Fixed bug in fromCSV

0.12.11 / 2015-05-11
====================
- Fixed bug where only first \r was being removed

0.12.10 / 2015-05-05
====================
- Added sortBy method

0.12.9 / 2015-05-02
===================
- Fixed bug in fromDelimited when passed string begins with quote
- Lint cleanup

0.12.8 / 2015-04-26
===================
- Added extract, replace and renameObjects methods

0.12.7 / 2015-04-19
===================
- Fixed null ref in getRoot method

0.12.6 / 2015-04-09
===================
- Added deepLength method

0.12.5 / 2015-04-09
===================
- Refactored internal implementation of _properties
- Removed static methods pathBranch, pathLeaf, removeItems and isSpacePath

0.12.4 / 2015-04-07
===================
- Undid change from 0.12.0. space.set("foo", 2) now preserves number types.

0.12.3 / 2015-04-07
===================
- Added getPath, getParent, and getRoot methods
- Added everyLeaf method
- Returning false in your fn passed to every now breaks early
- Fixed bug where set(property, someObject) would not convert someObject to space

0.12.2 / 2015-03-22
===================
- Code cleanup and slight peformance tweaks.

0.12.1 / 2015-03-22
===================
- Defined behavior for "has" method when value is empty.

0.12.0 / 2015-03-20
===================
- BREAKING: Renamed Space.isXPath to Space.isSpacePath.
- BREAKING: Removed never used getByIndexPath and setByIndexPath methods.
- BREAKING: Now space.set("foo", 2) !== space.get("foo"). We convert values to strings or space instances(if applicable).
- Misc code cleanup.

0.11.4 / 2015-03-17
===================
- Protect against following circular paths when loading from objects.
- delete(property: string) now deletes all occurrences of property in instance.
- Removed protection against prototype.js overwriting hasOwnProperty. If someone is using prototype.js with Space they'll need to compensate for that.

0.11.3 / 2015-03-15
===================
- Bug fix in indexOf

0.11.2 / 2015-03-15
===================
- Perf improvements. ~20% less memory from ditching propertiesCount.

0.11.1 / 2015-03-15
===================
- Added reverse method

0.11.0 / 2015-03-15
===================
- 20% mem perf improvement by creating less arrays.
- BREAKING CHANGE: Sort method now passes a and b as {property:string,value:any}, not [string, any]

0.10.5 / 2015-03-15
===================
- Added deep param to each
- Fixed reference bug when initializing new instances from other instances

0.10.4 / 2015-03-15
===================
- Made events a getter and now only initialize the events object when needed to save mem. About 5% mem improvement and significantly less objects created on heap.

0.10.3 / 2015-03-15
===================
- Added hasHeaders param to from delimited methods

0.10.2 / 2015-03-12
===================
- Added trim() method to remove empty properties
- Fixed bug in toString method which printed empty lines for null or undefined values

0.10.1 / 2015-03-08
===================
- BREAKING CHANGE: get(property: string) now returns the **last** matching pair and not the first.
- Minor code cleanup and additional tests.

0.9.9 / 2015-03-08
==================
- Code pruning and cleanup. Removed methods marked "experimental" and removes spacefs.

0.9.8 / 2015-02-25
==================
- Bug fix in the load2 parsing algo

0.9.7 / 2015-02-22
==================
- Fixed type error when passing undefined to get
- BREAKING CHANGE: Renamed isASet to isStringMap
- Added isFlat method

0.9.6 / 2015-02-22
==================
- BREAKING CHANGE: turned length() into a getter. To migrate simply replace all calls to length() with length

0.9.5 / 2015-02-22
==================
- Added pretty param to toJSON
- Updated github links

0.9.4 / 2015-02-22
==================
- Fixed bug in rename method where renames of non-existing entities corrupted object.

0.9.3 / 2015-02-22
==================
- Merged mapValues and mapProperties methods into one map method with params and
  added an inplace flag
- Added fromXml method

0.9.2 / 2015-02-18
==================
- MapValues method

0.9.1 / 2015-02-18
==================
- Added toXml method
- Removed the "propertyName?" property from the fromCsv and similar methods. Now use
  the row index as the property name.
- Added mapProperties method
- Fixed a bug where overwriting a pair was not updating cache
- Minor tweaks and improvements

0.9.0 / 2015-02-17
==================
- BREAKING CHANGE: passing in arrays to create new Space instances will now set
the property names to "0 1 2 3...N" instead of "item item item..." This makes it
easier to go from JSON => Space => JSON. This reverts the change introduced in 0.7.0,
which was a bad idea.
- Added guessTypes parameter to the toJSON and toObject methods for turning
space objects into JS objects with type information. Result is better JSON => Space => JSON
flows.

0.8.12 / 2015-02-01
===================
- Added optional parameter to fromDelimited methods to set row property name in returned object.

0.8.11 / 2015-01-31
===================
- Added option to split to allow for returning Space object in addition to array
- Added toCsv, toSsv, toTsv, and toDelimited methods
- Added perf stubs
- Slight performance improvements

0.8.8 / 2015-01-17
==================
- Added fromFile, toFile, fromUrl, and toUrl methods

0.8.7 / 2015-01-09
==================
- Added fromHeredoc method
- Miscellaneous fixes and cleanup

0.8.6 / 2015-01-06
==================
- Added split method

0.8.5 / 2015-01-06
==================
- Added getArray method

0.8.4 / 2013-12-22
==================
- Bug fix in getCud method

0.8.3 / 2013-12-09
==================
- Performance improvement

0.8.2 / 2013-12-08
==================
- Added renameAll method

0.8.1 / 2013-12-07
==================
- Added getValues method

0.8.0 / 2013-11-19
==================
- BREAKING CHANGE: firstType is now firstProperty, getTypes is now getProperties, lastType is now lastProperty
- Renamed "Type/Types/type" to "Property/Properties/property". Thanks to @jyxt for calling me on that bad name :)

0.7.3 / 2013-11-15
==================
- Fixed bug in each method where the index was a typeof string instead of number.

0.7.2 / 2013-11-15
==================
- Delete methods refactor

0.7.1 / 2013-11-15
==================
- Passing an int to .delete() now deletes the pair with that numeric index.

0.7.0 / 2013-11-15
==================
- BREAKING CHANGE: when parsing JSON/Arrays, we no longer set the key/type as "0..1..2..". Instead, we set type as "item"

0.6.0 / 2013-11-14
==================
- BREAKING CHANGE: firstKey() is now firstType()
- BREAKING CHANGE: getKeys() is now getTypes()
- renamed all occurrences of key/Key to type/Types.
- updated version.js to support passing a v#.

0.5.15 / 2013-11-13
===================
- ran beautify

0.5.14 / 2013-11-13
===================
- added beautify command
- fixed 'make version' to update space.js as well

0.5.13 / 2013-11-13
===================
- added History.md
- added version.js and 'make version' command
- added toggle method
