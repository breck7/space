Space
=====

Space is a whitespace encoding for associative arrays.

A space character separates a key from its value, and a new line separates key/value pairs.

Example
-------

An object like this:

    {"name" : "John", "age" : 29}

Can be encoded with Space like this:

    name John
    age 29


Try It Now
----------

http://space.nudgepad.com

Installing
----------

Node.js:

    npm install space

Using
-----

    // Creating a Space Object
    var person = new Space('name John')
    // Accessing a property    
    console.log(person.get('name'))
    // Setting a property
    person.set('age', 29)
    // Printing the object
    console.log(person.toString())
    
    

Examples
--------

Here's how I could encode a tax return:

    socialSecurityNumber 555-55-5555
    name John Smith
    taxYear 2012
    income 10,000
    dependents 1
    exemptions 2
    address 123 Main Street
    city San Francisco
    state California
   
Space supports recursion. Here's an example of web page stats:

    homepage
     pageviews 2312
     uniques 231
     referers
      about 23
      contact 41
    about
     pageviews 314
     uniques 201
     referers
      home 100
      contact 21
    contact
     pageviews 214
     uniques 124
     referers
      home 110
      about 10
    
Working with the above stats example:

    var stats = new Space(exampleStringFromAbove)
    // Get a nested property using an xpath like query
    stats.get('contact referers home')
    // Returns 110
    stats.set('about uniques', 500)


Uses
----

Space is a great alternative encoding wherever XML or JSON is currently used.




