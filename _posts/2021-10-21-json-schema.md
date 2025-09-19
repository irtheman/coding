---
layout: post
title:  'JSON Schema'
date:   2021-10-21 15:01:25 -0400
tags: info
---
## JSON Standards

Most people are not aware that there are standards for JSON – or lots of other things in the software development 
world. Let's have a look; if you are a learner this will push you forward...

JSON stands for &quot;**J**ava**S**cript **O**bject **N**otation&quot;, a simple data interchange format. There are lots of these data interchange formats but JSON is great for web development due to its strong ties to Javascript and, of course, Java.

## JSON Structure

JSON supports the following data structures but they all have different interpretations in various programming
languages:
* object:

  > { 'key1': 'value1', 'key2': 'value2' }

* array:

  > [ 'first', 'second', 'third' ]

* number:

  > 42

  > 3.1415926

* string:

  > 'This is a string'

* boolean:
  
  > true
  
  > false

* null:
  
  > null


What some people might expect with JSON:
```yaml
{
  'name': 'John Doe',
  'birthday': 'February 22, 1978',
  'address': 'Richmond, Virginia, United States'
}
```

What JSON should look like:
```yaml
{
  'first_name': 'John',
  'last_name': 'Doe',
  'birthday': '1978-02-22',
  'address': {
    'home': true,
    'street_address': '2020 Richmond Blvd.',
    'city': 'Richmond',
    'state': 'Virginia',
    'country': 'United States'
  }
}
```

One of the JSON sample representations is better than the other. The first is quick and dirty while the second has a thought out structure. A schema makes the second one even better and easier to interpret when one could need to support multiple consumers or using various programming languages.

This is an example of the JSON Schema for the second JSON sample. Note how it is still JSON also:
```yaml
{
  '$id': 'https://yoursite.com/person.schema.json',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'title': 'Person',
  'type': 'object',
  'properties': {
    'first_name': { 'type': 'string' },
    'last_name': { 'type': 'string' },
    'birthday': { 'type': 'string', 'format': 'date' },
    'address': {
      'type': 'object',
      'properties': {
        'home': {'type': 'boolean' }
        'street_address': { 'type': 'string' },
        'city': { 'type': 'string' },
        'state': { 'type': 'string' },
        'country': { 'type' : 'string' }
      }
    }
  }
}
```

## Declaring a JSON Schema

A schema needs to be shared. It is a way of saying &quot;This is what we expect from our clients and what we will
deliver.&quot; Doesn't this make life simpler rather than guessing around until something works?

Is this something new? Nope, even XML had schema. Do you remember XSL? There was a reason for that. Every
programming language out there has a &quot;schema&quot; as well.

In the above example JSON schema one should have noticed the &quot;type&quot; keyword. A JSON property can often be misinterpreted. &quot;Is it a number? A string? An object? What do I provide?&quot;, would be some common questions.

In the schema, &quot;type&quot; specifies the JSON type that is accepted. Sometimes a producer / consumer can handle multiple types but we need to be specific.

```yaml
{ 'type': 'number' }
```
  > Accepts number only.

 ```yaml
 { 'type': [number, string] }
 ```
 > Accepts number or string.
```yaml
{ 'type': 'integer' }
```
> Accepts integer number only.

Additional attributes can accompany a &quot;type&quot;. For example, one could add 'description', 'minimum', 'maximum', 'minLength', 'maxLength', 'pattern', 'format' and more properties. Just stick to the standards one makes.

The JSON schema also includes annotations like '$schema' __(points to the type of schema being used)__, 'title',
'description', 'default', 'examples', '$comment', 'enum', 'const', 'required' and many more.

## Non-JSON Data
To include non-JSON data one can also make use of the schema to clarify what is being passed around by using 
annotations like 'contentMediaType' and 'contentEncoding'. 

As an example, the proposed schema:
```yaml
{
  'type': 'object',
  'properties': {
    'contentEncoding':  { 'type': 'string' },
    'contentMediaType':  { 'type': 'string' },
    'data':  { 'type': 'string' }
  }
}
```

The sample data:
```yaml
{
  'contentEncoding': 'base64',
  'contentMediaType': 'image/png',
  'data': 'iVBORw0KGgoAAAANSUhEUgAAABgAAAA...'
}
```

## References
For more details: <https://json-schema.org>

Specification: <https://json-schema.org/specification.html>

If you need help making a JSON schema: <https://jsonschema.net/>