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

  var gen = function (json, dotNotation) {
    // generate docs HTML
    // preset empty string
    var html = ''
    // dot notation object path
    if (!dotNotation) {
      dotNotation = ''
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
        // new field ID for HTML elements
        var id = dotNotation.replace('.', '-') + field

        // stripped rows
        if (rowBgClass !== '') {
          rowBgClass = ''
        } else {
          // https://getbootstrap.com/docs/4.0/utilities/colors/
          rowBgClass = ' bg-light'
        }

        // details inside collapsible divs
        // https://getbootstrap.com/docs/4.1/components/collapse/
        var detailsButton = ''
        var detailsContent = ''
        var setupDetails = function (btnText) {
          if (!btnText) {
            btnText = 'More info'
          }
          if (detailsButton === '') {
            // set button HTML
            detailsButton = '<button class="btn btn-sm btn-info mt-1" type="button" ' +
                            'data-toggle="collapse" data-target="#' + id + '" aria-expanded="false" ' +
                            'aria-controls="' + id + '">' + btnText + '</button>'
          }
        }
        var detailsRow = function (name, val) {
          // HTML for field spec rows
          // eg.: minimum number, string max length...
          return '<div><var class="text-muted">' + name + '</var>&nbsp;&nbsp;<samp>' + val + '</samp></div>'
        }

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
          case 'string':
            setupDetails()
            for (var spec in prop) {
              if (spec !== 'description' && prop.hasOwnProperty(spec)) {
                // add spec to field details content
                detailsContent += detailsRow(spec, prop[spec])
              }
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
                      '<div>' + description + '</div>' +
                      detailsButton +
                      '<div class="collapse" id="' + id + '">' +
                        '<div class="card card-body mt-2">' + detailsContent + '</div>' +
                      '</div>' +
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
