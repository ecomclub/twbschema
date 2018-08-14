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
    // one property per row
    var rowBgClass = ''
    for (var field in props) {
      if (props.hasOwnProperty(field)) {
        // stripped rows
        if (rowBgClass !== '') {
          rowBgClass = ''
        } else {
          // https://getbootstrap.com/docs/4.0/utilities/colors/
          rowBgClass = ' bg-light'
        }

        // details inside collapsible divs
        // https://getbootstrap.com/docs/4.1/components/collapse/
        var contentButtons = ''
        var contentCollapses = ''
        // mark required fields
        var labelRequired = ''
        if (Array.isArray(req)) {
          for (var i = 0; i < req.length; i++) {
            if (field === req[i]) {
              // field is requred
              labelRequired = '<div class="text-danger">* required</div>'
              break
            }
          }
        }

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

        // render row HTML
        html += '<div class="row align-items-center border-bottom' + rowBgClass + '">' +
                  '<div class="col-xs-12 col-4">' +
                    '<div class="p-3">' +
                      '<code>' + field + '</code>' +
                      '<div class="small">' +
                        '<span class="text-muted">' + type + '</span>' +
                        labelRequired +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="col">' +
                    '<div class="p-3">' +
                      description +
                      contentButtons +
                      contentCollapses +
                    '</div>' +
                  '</div>' +
                '</div>'
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
      if (typeof el === 'object' && el !== null && el.innerHTML) {
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

// Sample: https://jsfiddle.net/8rzyboan/30/
