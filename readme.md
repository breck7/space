Space
=====

Space is a lightweight language for data.

Space is like XML or JSON, with less features and syntax.

Example
-------

An object like this:

    {"name" : "John", "age" : 29}
    
    <person><name>John</name><age>29</age></person>

Can be written in Space like this:

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

Here's how I could write a tax return in Space:

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

Space is a great encoding anytime you have objects that you want to be human readable and writeable.

Pretty much anywhere JSON or XML is currently used, Space may be helpful.

Release Schedule
----------------

We aim to have a final 1.0 release of Space by the end of 2013.

Technical Definition
--------------------

Space is a whitespace encoding for associative arrays.

A space character separates a key from its value, a new line separates key/value pairs, and a new line
plus space(s) indicates nesting.

License
-------

Space is released to the Public Domain.


Build Status
------------

[![Build Status](https://travis-ci.org/nudgepad/space.png?branch=master)](https://travis-ci.org/nudgepad/space)
