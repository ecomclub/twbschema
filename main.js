/**
 * twbschema
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

window.twbschema = (function () {
  'use strict'

  var escapeStr = function (str) {
    // abstraction for string escaping with RegExp
    if (typeof str === 'string') {
      return str.replace(/(([\w-]+)?(_|\+|\*)([\w-]+)?)/g, '`$1`')
    } else {
      return ''
    }
  }

  var gen = function (json, html) {
    // generate docs HTML
    if (!html) {
      // preset
      html = ''
    }

    // start treating schema
    // Ref.: http://json-schema.org/specification.html
    // array of required fields
    var req = json.required
    // merge all object properties
    var props = Object.assign({}, json.properties, json.patternProperties)

    // check each object property
    for (var field in props) {
      if (props.hasOwnProperty(field)) {
        var prop = props[field]
        var type = prop.type
        if (Array.isArray(type)) {
          // use first (most important ?) type
          type = type[0]
        }
        var description = escapeStr(prop.description)

        switch (type) {
          case 'integer':
          case 'number':
            if (prop.hasOwnProperty('minimum')) {
              description += ' - Mininum: **' + prop.minimum + '**'
            }
            if (prop.hasOwnProperty('maximum')) {
              description += ' - Maximum: **' + prop.maximum + '**'
            }
            if (prop.hasOwnProperty('multipleOf')) {
              description += ' - Max precision: **' + prop.multipleOf + '**'
            }
            break
        }

        console.log(req, type, description)
      }
    }

    // returns rendered HTML
    return html
  }

  var doc = function (el, schema) {
    // main function
    // receives DOM element and JSON Schema
    // parse object first
    var json, err
    if (typeof schema === 'string') {
      try {
        json = JSON.parse(schema)
      } catch (e) {
        err = e
      }
    } else if (typeof schema === 'object' && schema !== null) {
      json = schema
    } else {
      err = new Error('Schema must be a valid JSON object or string')
    }

    if (err) {
      console.error('[twbschema fatal error (invalid schema)]', err)
    } else {
      // valid
      // convert JSON Schema to docs UI
      var html = gen(json)
      if (typeof el === 'object' && el !== null && el.hasOwnProperty('innerHTML')) {
        el.innerHTML = html
      } else {
        // not a DOM element
        // just return HTML string
        return html
      }
    }
  }

  // return methods
  return {
    'doc': doc
  }
}())
