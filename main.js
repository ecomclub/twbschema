/**
 * twbschema
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

window.twbschema = (function () {
  'use strict'

  var gen = function (json, html) {
    // generate docs HTML
    if (!html) {
      // preset
      html = ''
    }
    // merge all object properties
    Object.assign(json, json.properties, json.patternProperties)

    // returns rendered HTML
    return html
  }

  var doc = function (element, schema) {
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
      element.innerHTML = gen(json)
    }
  }

  // return methods
  return {
    'doc': doc
  }
}())
