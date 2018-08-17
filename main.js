/**
 * twbschema
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

window.twbschema = (function () {
  'use strict'

  // regex to find object properties on text
  var propertyRegex = /([[(]?([\w-]+)?(_|\*)([\w-]+)?[\])]?)/g

  var gen = function (json, dotNotation) {
    var i
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
            detailsButton = '<button class="btn btn-sm btn-info mt-2" type="button" ' +
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
          for (i = 0; i < req.length; i++) {
            if (field === req[i]) {
              // field is requred
              labelRequired = '<span class="text-danger ml-2">required</span>'
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
        var description
        if (prop.description) {
          // mark other refered fields on description
          description = prop.description.replace(propertyRegex, '<samp class="text-info">$1</samp>')
        } else {
          description = ''
        }

        // render optional list of field specifications
        var specsList = ''
        var addSpec = function (name, val) {
          // HTML for field spec rows
          // eg.: minimum number, string max length...
          // samp tag HTML
          var samp
          if (Array.isArray(val) && typeof val[0] !== 'object') {
            // array of strings or numbers
            samp = ''
            for (var i = 0; i < val.length; i++) {
              if (i > 0) {
                // not first value
                samp += '<span class="text-muted mx-1"> · </span>'
              }
              samp += '<samp>' + val[i] + '</samp>'
            }
          } else {
            switch (typeof val) {
              case 'string':
              case 'number':
                samp = val
                break
              default:
                // object, boolean or null
                samp = JSON.stringify(val)
            }
            // single value
            samp = '<samp>' + samp + '</samp>'
          }
          // add li element to specs list
          specsList += '<li><span class="text-muted mr-1">' + name + ': </span>' + samp + '</li>'
        }

        if (prop.hasOwnProperty('default')) {
          // mark default value
          addSpec('Default', prop.default)
        }
        if (prop.enum) {
          // array of possible values
          addSpec('Possible values', prop.enum)
        }

        switch (type) {
          case 'integer':
          case 'number':
            break
          case 'string':
            setupDetails()
            for (var spec in prop) {
              switch (typeof prop[spec]) {
                case 'string':
                case 'number':
                  // skip description
                  if (spec !== 'description') {
                    // add spec to field details content
                    detailsContent += detailsRow(spec, prop[spec])
                  }
                  break
              }
            }
            break
        }

        if (specsList !== '') {
          // has specification(s)
          // setup ul element HTML
          specsList = '<ul class="small list-unstyled mt-sm-3 mb-3">' + specsList + '</ul>'
        }

        // render row HTML
        html += '<div class="border-bottom px-3' + rowBgClass + '">' +
                  '<div class="row align-items-center">' +
                    '<div class="col-sm-7">' +
                      '<div class="my-3">' +
                        '<code>' + field + '</code>' +
                        '<code class="text-muted small"><br>' + type + labelRequired + '</code>' +
                        '<div class="small">' + description + '</div>' +
                      '</div>' +
                    '</div>' +
                    '<div class="col">' +
                      specsList +
                    '</div>' +
                  '</div>' +
                  '<div class="collapse" id="' + id + '">' +
                    '<div class="card card-body mb-3 py-2 px-3">' + detailsContent + '</div>' +
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
